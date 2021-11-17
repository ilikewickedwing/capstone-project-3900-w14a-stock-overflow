/**
  This file manages all API specific functions
*/

import axios from "axios";

let apikey = 'NJGHG3ZAKLAELM3E';
let keys = ['FLKB7SQBXHGISR7I','59SO8FIM49NYQS21','WP9NFOYE83L4FABK','5TZVKFQR250ZAQZ4','E23ORO62TPLB096R'];
let useCounter = 0;
axios.defaults.headers.common['Authorization'] = 'Bearer kZDTsjtl4ZQwiTdjRFUOR4H9til8';
axios.defaults.headers.common['Accept'] = 'application/json';

export class API {
  constructor() {
    // Stores the last cached stocks
    this.cachedStocks = [];
    // Stores full stock cache
    this.fullCache = null;
    // Stores the full information of stocks
    this.infoCache = [];
    // How long in millisecond before calling get all stocks again
    this.useCounter = 0;
  }

	/**
	 * Function to get list of all stocks
	 * @returns {Promise<Array>}
	 */
  async getAllStocks() {
    // Return cached stocks if available
    if (this.fullCache !== null) {
      return this.fullCache;
    }
    // Else cache doesnt exist so fetch it
    const resp = await this._getAllStocks();
    return resp;
  }
  
  /**
	 * Function to call AlphaVantage to get all stocks
	 * @returns {Promise<Array>}
	 */
  async _getAllStocks() {
    const stocks = [];
    // Fetching the list of active stocks
    const request = await axios.get(`https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${apikey}`);
    let result = request.data;  				// Converting result into text
    result = result.split('\n');        // Splitting every entry

    // Going through every entry
    result.forEach(stock => {
        const info = stock.split(',');
        if (info[3] == "Stock") {   		// only add to list if the entry is a stock and not a fund
            stocks.push({
                symbol: info[0],
                name: info[1],
            })
        }
    });
    // Cache the stocks
    this.fullCache = stocks;
    return stocks;
  }

	/**
	 * Function to call the api for stocks given
	 * @param {string} stocks 
	 * @returns {Promise<Array>}
	 */
  async lookupStock(stocks) {
    const search = this.cachedStocks.filter(o => (o.stocks === stocks));
    if (search.length !== 0) {
      return search[0].check;
    }

    const resp = await this._callTradier(-1, stocks);
    if (resp.securities == null) return null;
    const check = resp.securities.security;

    const obj = {
      stocks: stocks,
      check: check
    }

    this.cachedStocks.push(obj);
    return check;
  }

	/**
	 * Function to check on market status
	 * @returns {Promise<Boolean>}
	 */
  async marketStatus() {
    const status = await this._callTradier(4);
    return (status === 'closed');
  }

	/**
	 * Function to search stock information based on parameter
	 * @param {string} type 
	 * @param {string} stocks 
	 * @param {string} interval 
	 * @param {string} start 
	 * @returns {Promise<Object>}
	 */
  async getStock(type, stocks, interval, start) {
    // Search for stock in cache
    const search = this.infoCache.filter(o => (o.symbol === stocks) && (o.param === type) && (o.interval === interval) && (o.start === start));
    const time = Date.now();

    if (search.length !== 0 && time - search[0].time < 600000) {
      return search[0];
    }

    // Fetch stock and add to cache
    const resp = await this._getStock(type, stocks, interval, start);
    return resp;
  }

  /**
   * Calls an api to get information depending on params
   * Type params:
   *  0. Information overview of stock (AlphaVantage)
   *  1. Current price of multiple stocks (Tradier)
   *  2. History of one stock not intraday (Tradier)
   *  3. History of one stock intraday (Tradier)
   * @param {int} type 
   * @param {string} stocks 
   * @param {string} interval
   *  For not intraday, options are: daily, weekly, monthly
   *  For intraday, options are: 1min, 5min, 15min
   * @param {string} start
   *  For not intraday, format is string as YYYY-MM-DD
   *  For intraday, format is string as YYYY-MM-DD HH:MM
   * @returns {Promise <object>}
   */
  async _getStock(type, stocks, interval, start) {

    let data = null;
    if (parseInt(type) === 0) {
      data = await this._callAlpha(type, stocks);
    } else {
      data = await this._callTradier(type, stocks, interval, start);
    }
    
    const time = new Date();
    const obj = {
      symbol: stocks,
      param: type,
      interval: interval,
      start: start,
      data: data,
      time: time
    }
    
		this.infoCache.push(obj);

    return obj;
  }

  /**
   * Returns the information for the stock
   * @param {string} stock 
   * @returns {Promise <object>}
   */
  async _callAlpha(type, stock) {

    let url = null;

    if (type === -1) url = "LISTING_STATUS";
    else if (type === 0) url = "OVERVIEW";
    
    if (this.useCounter == 5) {
      keys.push(apikey);
      apikey = keys.shift();
      this.useCounter = 0;
    }

    const request = await axios.get(`https://www.alphavantage.co/query?function=${url}&symbol=${stock}&apikey=${apikey}`);
    
    if (request.data.Note !== undefined) {
      this.useCounter = 5;
      return await this._callAlpha(type, stock);
    }
    this.useCounter++;
    
    return request.data;
  }

  /**
   * Calls tradier api to get stock information
   * Type params:
   *  1. Current price of multiple stocks
   *  2. History of one stock not intraday
   *  3. History of one stock intraday
   *  4. Current status of market
   * @param {int} type 
   * @param {string} stocks 
   * @param {string} interval
   *  For not intraday, options are: daily, weekly, monthly
   *  For intraday, options are: 1min, 5min, 15min
   * @param {string} start
   *  For not intraday, format is string as YYYY-MM-DD
   *  For intraday, format is string as YYYY-MM-DD HH:MM
   * @returns {Promise <object>}
   */
  async _callTradier(type, stocks, interval, start) {
    let url = null;
    let symbols = null;
    let symbol = null;
    let q = null;
    let indexes = null;
    
    if (type === 1) {
      url = 'quotes';
      symbols = stocks;
    } else if (type === 2) {
      url = 'history';
      symbol = stocks;
    } else if (type === 3) {
      url = 'timesales';
      symbol = stocks;
    } else if (type === 4) {
      url = 'clock';
    } else if (type === -1) {
      url = 'lookup'
      q = stocks;
      indexes = false;
    }

    const request = await axios({
      method: 'get',
      url: url,
      baseURL: 'https://sandbox.tradier.com/v1/markets/',
      params: {
				'symbols': symbols,
				'symbol': symbol,
				'interval': interval,
				'start': start,
				'q': q,
				'indexes': indexes,
				'greeks': 'false'
      },
    }, (error, response, body) => {
			console.log(response.statusCode);
			console.log(body);
    });
    return request.data;
  }
}