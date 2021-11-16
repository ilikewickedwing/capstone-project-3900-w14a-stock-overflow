/**
  This file manages all stocks specific functions
*/

import { Database } from "./database.js";
import axios from "axios";
import { API } from "./api.js";

export const api = new API();

/**
 * Gets a list of active stocks from the api
 * @returns {Promise <[{symbol: String, name: String}]>}
 * A list of stocks with their symbol and name
 */
export const getAllStocks = async () => {
  const resp = await api.getAllStocks();
  return resp;
}

/**
 * Adds a stock to a portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {string} stock 
 * @param {float} price 
 * @param {int} quantity 
 * @param {Database} database
 * @returns {Promise}
 */
export const addStock = async (token, pid, stock, price, quantity, brokerage, brokerFlag, database) => {
  let flag = null;
  // Finding corresponding user for the given token
  const uid = await database.getTokenUid(token);
  if (stock === '') return 2;
  // Return error if user not found
  if (uid === null) {
    return 1;
  }

  if (stock === '') return 2;

  // Return error if stock is not valid
  if (!await checkStock(stock)) {
    return 2;
  }

  const get = await database.openPf(pid);
  // Return error if pid is not valid
  if (get == null) return 3;
  
  const name = get.name;
  if (name !== 'Watchlist') {
    // Return error if quantity of stock is not valid
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return 4;
    }
    
    // Return error if price is not valid
    if (isNaN(price) || price <= 0) {
      return 5;
    }

    let brokerageNum = parseFloat(brokerage);

    // Return error if brokerage is not valid
    if (brokerage === null) {
      // Return error if no default brokerage value set
      const resp = await database.getDefBroker(uid);
      brokerageNum = resp.defBroker;
      flag = resp.brokerFlag;
      // console.log(brokerageNum);
      if (brokerageNum === null) {
        return 7;
      }
    } else {
      // Return error if brokerage is not valid
      if (isNaN(brokerageNum) || brokerageNum < 0) {
        return 8;
      }

      // Return error if flag is not valid
      if (!(brokerFlag === 0 || brokerFlag === 1)) {
        return 9;
      } else {
        flag = brokerFlag;
      }
    }

    // Return result of adding stock to portfolio
    const addResp = await database.addStocks(pid, stock, price, quantity, brokerageNum, flag);
    // Creating activity
    await database.createActivity(uid, `bought ${quantity} ${stock} at $${price} 📈📈`, null);
    return addResp;
  } else {
    // Return result of adding stock to watchlist
    return await database.addStocks(pid, stock, null, null, null, null);
  }
}

/**
 * Modifies an existing stock inside the portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {string} stock 
 * @param {float} price 
 * @param {int} quantity 
 * @param {int} option 0 = sell, anything else = buy
 * @param {Database} database
 * @returns {Promise <boolean>}
 */
export const modifyStock = async (token, pid, stock, price, quantity, option, brokerage, brokerFlag, database) => {
  let flag = null;
  // Finding corresponding user for the given token
  const uid = await database.getTokenUid(token);
  if (stock === '') return 2;
  // Return error if user not found
  if (uid === null) {
    return 1;
  }

  // Return error if stock is not valid
  if (!await checkStock(stock)) {
    return 2;
  }

  const get = await database.openPf(pid);
  // Return error if pid is not valid
  if (get == null) return 3;
  
  let brokerageNum = parseFloat(brokerage);
  const name = get.name;
  if (name !== 'Watchlist') {  
    // Return error if quantity of stock is not valid
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return 6;
    }
    
    // Return error if price is not valid
    if (isNaN(price) || price <= 0) {
      return 7;
    }

    // Return error if brokerage is not valid
    if (brokerage === null) {
      // Return error if no default brokerage value set
      const resp = await database.getDefBroker(uid);
      brokerageNum = resp.defBroker;
      flag = resp.brokerFlag;
      if (isNaN(brokerageNum) || brokerageNum < 0 || brokerageNum === null) {
        return 9;
      }
    } else {
      // Return error if brokerage is not valid
      if (isNaN(brokerageNum) || brokerageNum < 0) {
        return 8;
      }

      // Return error if flag is not valid
      if (!(brokerFlag === 0 || brokerFlag === 1)) {
        return 9;
      } else {
        flag = brokerFlag;
      }
    }
  }
  
  const bkCost = brokerageNum;
  let resp = null;
  // Determine if buying or selling stocks
  if (option) {
    // Return result of buying stocks
    resp = await database.addStocks(pid, stock, price, quantity, bkCost, flag);
    // Creating activity
    await database.createActivity(uid, `bought ${quantity} ${stock} at $${price} 📈📈`, null);
  }
  else {
    // Return result of selling stocks
    resp = await database.sellStocks(pid, stock, price, quantity, bkCost, flag);
    // Creating activity
    await database.createActivity(uid, `sold ${quantity} ${stock} at $${price} 💰💰`, null);
  }
  
  return resp;
}

/**
 * Function to check if a stock, or series of stocks is valid
 * @param {string} stock 
 * @returns 
 */
export const checkStock = async (stock) => {
  // console.log("checkStock time for " + stock);
  // const stocks = await api.getAllStocks();
  // console.log("received all stocks");
  const symbols = stock.split(",");

  for (let i = 0; i < symbols.length; i++) {
    // console.log("symbol is " + symbols[i]);
    // const filteredStock = stocks.filter(o => o.symbol === symbols[i])
    // console.log(symbols[i]);
    const resp = await api.lookupStock(symbols[i]);
    if (resp == null) return false;
    if (Array.isArray(resp)) {
      const filteredStock = resp.filter(o => o.symbol === symbols[i]);
      if (filteredStock.length === 0) return false;
    } else {
      if (resp.symbol !== symbols[i]) return false;
    }
  }

  return true;
}

/**
 * Function to retrieve stock from api
 * @param {string} stock 
 * @param {int} param
 * @returns {Promise <Object>}
 */
export const getStock = async (type, stocks, interval, start) => {
  const check = await checkStock(stocks);
  if (!check) return -1;

  const typeInt = parseFloat(type);
  if (typeInt < 0 || typeInt > 3 || !Number.isInteger(typeInt)) return -2;

  if (typeInt === 2 && interval) {
    if (interval.match(/^(daily|weekly|monthly)$/) === null) return -3;
  }

  if (typeInt === 3 && interval) {
    if (interval.match(/^(1min|5min|15min)$/) === null) return -3;
  }

  if (start) {
    const startCheck = start.toString();
    if (typeof(startCheck) !== 'string') return -4;

    const today = Date.now();
    const dateCheck = Date.parse(start);
    if (dateCheck > today) return -4;

    if (typeInt === 2 && startCheck.match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/) === null) return -4;
    if (typeInt === 3 && startCheck.match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) ([0-1][0-9]|2[0-4]):([0-5][0-9])$/) === null) return -4;
  }

  const resp = await api.getStock(typeInt, stocks, interval, start);
  // console.log(stocks);
  return resp;
}