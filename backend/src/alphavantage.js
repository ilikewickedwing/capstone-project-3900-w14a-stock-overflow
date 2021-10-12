

export class Alphavantage {
  constructor() {
    // Stores the last cached stocks
    this.cachedStocks = null;
    // How long in millisecond before calling get all stocks again
    const pollingInterval = 60000;
    this.intervalObj = setInterval(this._getAllStocks.bind(this), pollingInterval);
  }
  
  async getAllStocks() {
    // Return cached stocks if available
    if (this.cacheStocks !== null) {
      return this.cachedStocks;
    }
    // Else cache doesnt exist so fetch it
    const resp = await this._getAllStocks();
    return resp;
  }
  
  // This makes the actual call to alpha vantage
  async _getAllStocks() {
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
  // Call this when deleting this object to remove all time intervals
  // to prevent a memory leak
  destroy() {
    // Clear interval
    clearInterval(this.intervalObj);
  }
}