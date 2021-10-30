import axios from "axios";
const apikey = "demo";

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
      console.log("returning cache")
      return this.cachedStocks;
    }
    console.log("fetching cache");
    // Else cache doesnt exist so fetch it
    const resp = await this._getAllStocks();
    return resp;
  }
  
  // This makes the actual call to alpha vantage
  // Dont call this directly
  async _getAllStocks() {
    const stocks = [];
    // Fetching the list of active stocks
    const request = await axios.get(`https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${apikey}`);
    let result = await request.data;  // Converting result into text
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
    console.log(this.infoCache);
    // Search for stock in cache
    const search = this.infoCache.filter(o => o.symbol === stock);
    const time = Date.now();

    if (search.length !== 0) {
      console.log(search[0].time);
      console.log(time - search[0].time);
    }
    if (search.length !== 0 && time - search[0].time < 600000) {
      console.log("returning cached stock");
      return search;
    }

    console.log("fetching cache");
    // Fetch stock and add to cache
    const resp = await this._getStock(stock);
    return resp;
  }

  async _getStock(stock) {
    const dailyRequest = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock}&apikey=${apikey}`);
    const weeklyRequest = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${stock}&apikey=${apikey}`);


    const priceRequest = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${apikey}`);     
    const infoRequest = await axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stock}&apikey=${apikey}`); 
    
    //console.log(await dailyRequest.data);

    const time = new Date();
    const obj = {
      symbol: 'IBM',
      data: {
        daily: dailyRequest.data,
        weekly: weeklyRequest.data,
        price: priceRequest.data,
        info: infoRequest.data,
      },
      time: time
    }
    
    this.infoCache.push(obj);

    return obj;
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