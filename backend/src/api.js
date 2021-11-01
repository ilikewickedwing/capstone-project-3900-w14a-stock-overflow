import axios from "axios";
let apikey = 'NJGHG3ZAKLAELM3E';
let keys = ['FLKB7SQBXHGISR7I','59SO8FIM49NYQS21','WP9NFOYE83L4FABK','5TZVKFQR250ZAQZ4','E23ORO62TPLB096R'];
let useCounter = 0;
axios.defaults.headers.common['Authorization'] = 'Bearer kZDTsjtl4ZQwiTdjRFUOR4H9til8';
axios.defaults.headers.common['Accept'] = 'application/json';

export class API {
  constructor() {
    // Stores the last cached stocks
    this.cachedStocks = null;
    // Stores the full information of stocks
    this.infoCache = [];
    // How long in millisecond before calling get all stocks again
    const pollingInterval = 60000;
    this.intervalObj = setInterval(() => {this._getAllStocks()}, pollingInterval);
    this.useCounter = 0;
  }
  
  async getAllStocks() {
    // Return cached stocks if available
    if (this.cachedStocks !== null) {
      return this.cachedStocks;
    }
    // Else cache doesnt exist so fetch it
    const resp = await this._getAllStocks();
    return resp;
  }
  
  // This makes the actual call to alpha vantage
  // Dont call this directly
  async _getAllStocks() {
    const stocks = [];
    // Fetching the list of active stocks
    let result = await this._callAlpha("LISTING_STATUS","no stock");  // Converting result into text

    result = result.split('\n');        // Splitting every entry

    // Going through every entry
    result.forEach(stock => {
        const info = stock.split(',');
        if (info[3] == "Stock") {   // only add to list if the entry is a stock and not a fund
            stocks.push({
                symbol: info[0],
                name: info[1],
            })
        }
    });
    // Cache the stocks
    this.cachedStocks = stocks;

    return stocks;
  }

  async getStock(type, stocks, interval, start) {
    // console.log(this.infoCache);
    // console.log("stock requested is " + stock);
    // Search for stock in cache
    /* const search = this.infoCache.filter(o => (o.symbol === stock) && (o.param === param));
    const time = Date.now();

    if (search.length !== 0) {
      // console.log(search[0].time);
      // console.log(time - search[0].time);
    }
    if (search.length !== 0 && time - search[0].time < 600000) {
      // console.log("returning cached stock");
      return search[0];
    }

    console.log("fetching cache"); */
    // Fetch stock and add to cache
    const resp = await this._getStock(type, stocks, interval, start);
    // console.log(resp);
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
    if (type == 0) {
      data = await this._callAlpha(stocks);
    } else {
      data = await this._callTradier(type, stocks, interval, start);
    }
    
    const time = new Date();
    const obj = {
      symbol: stocks,
      param: type,
      data: data,
      time: time
    }
    
    // console.log(obj);
    this.infoCache.push(obj);

    return obj;
  }

  /**
   * Returns the information for the stock
   * @param {string} stock 
   * @returns {Promise <object>}
   */
  async _callAlpha(stock) {

    console.log("useCounter is " + this.useCounter);
    
    if (this.useCounter == 5) {
      keys.push(apikey);
      apikey = keys.shift();
      this.useCounter = 0;
    }
    console.log("THE KEY IS " + apikey);
    const request = await axios.get(`https://www.alphavantage.co/query?function='OVERVIEW'&symbol=${stock}&apikey=${apikey}`);
    
    
    console.log(request.data);
    // how do this work
    if (request.data.Note !== undefined) {
      console.log("note detected, we go again");
      this.useCounter = 5;
      return this._callAlpha(type, stock);
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

    
    if (type == 1) {
      url = 'quotes';
      symbols = stocks;
    } else if (type == 2) {
      url = 'history';
      symbol = stocks;
    } else if (type == 3) {
      url = 'timesales';
      symbol = stocks;
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
         'greeks': 'false'
      },
    }, (error, response, body) => {
        console.log(response.statusCode);
        console.log(body);
    });

    return request.data;
  }

  checkStock(check, against) {
    return check == against;
  }

  // Call this when deleting this object to remove all time intervals
  // to prevent a memory leak
  destroy() {
    // Clear interval
    clearInterval(this.intervalObj);
  }
}