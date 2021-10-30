import axios from "axios";
let apikey = 'NJGHG3ZAKLAELM3E';
let keys = ['59SO8FIM49NYQS21','WP9NFOYE83L4FABK','5TZVKFQR250ZAQZ4','FLKB7SQBXHGISR7I'];
let useCounter = 0;

export class Alphavantage {
  constructor() {
    // Stores the last cached stocks
    this.cachedStocks = null;
    // Stores the full information of stocks
    this.infoCache = [];
    // How long in millisecond before calling get all stocks again
    const pollingInterval = 60000;
    this.intervalObj = setInterval(() => {this._getAllStocks()}, pollingInterval);
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
    let result = await this._callApi("LISTING_STATUS","no stock");  // Converting result into text

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

  async getStock(stock) {
    // console.log(this.infoCache);
    // console.log("stock requested is " + stock);
    // Search for stock in cache
    const search = this.infoCache.filter(o => o.symbol === stock);
    const time = Date.now();

    if (search.length !== 0) {
      // console.log(search[0].time);
      // console.log(time - search[0].time);
    }
    if (search.length !== 0 && time - search[0].time < 600000) {
      // console.log("returning cached stock");
      return search[0];
    }

    console.log("fetching cache");
    // Fetch stock and add to cache
    const resp = await this._getStock(stock);
    console.log(resp);
    return resp;
  }

  async _getStock(stock) {
    //console.log(await dailyRequest.data);

    const time = new Date();
    const obj = {
      symbol: stock,
      data: {
        intraday: await this._callApi('TIME_SERIES_INTRADAY' + '&interval=1min', stock),
        daily: await this._callApi('TIME_SERIES_DAILY_ADJUSTED', stock),
        weekly: await this._callApi('TIME_SERIES_WEEKLY_ADJUSTED', stock),
        monthly: await this._callApi('TIME_SERIES_MONTHLY_ADJUSTED', stock),
        price: await this._callApi('GLOBAL_QUOTE', stock),
        info: await this._callApi('OVERVIEW', stock),
      },
      time: time
    }
    
    console.log(obj);
    this.infoCache.push(obj);

    return obj;
  }

  async _callApi(type, stock) {
    const request = await axios.get(`https://www.alphavantage.co/query?function=${type}&symbol=${stock}&apikey=${apikey}`);
    useCounter++;
    if (useCounter === 5) {
      keys.push(apikey);
      apikey = keys.shift();
      useCounter = 0;
    }
    return await request.data;
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