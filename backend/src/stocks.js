/**
  This file manages all stocks specific functions
*/

import { Database } from "./database.js";
import axios from "axios";
import { API } from "./api.js";

export const api = new API();

/**
 * Gets a list of active stocks
 * @returns {Promise <[{symbol: String, name: String}]>}
 * A list of stocks with their symbol and name
 * 
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
 * @returns {Promise <boolean>}
 */
export const addStock = async (token, pid, stock, price, quantity, database) => {
  // Finding corresponding user for the given token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 1;
  }

  /* if (!await checkStock(stock)) {
    return 2;
  } */

  // Check for watchlist
  const get = await database.openPf(pid);
  if (get == null) return 3;
  const name = get.name;

  if (name !== 'Watchlist') {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return 4;
    } else if (isNaN(price) || price <= 0) {
      return 5;
    } else {
      return await database.addStocks(pid, stock, price, quantity);
    }
  } else {
    return await database.addStocks(pid, stock, null, null);
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
export const modifyStock = async (token, pid, stock, price, quantity, option, database) => {
  // Finding corresponding user for the given token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 1;
  }

  if (!await checkStock(stock)) {
    return 2;
  }

  // Check for watchlist
  const get = await database.openPf(pid);
  if (get == null) return 3;
  const name = get.name;

  if (name !== 'Watchlist') {    
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return 6;
    } 
      
    if (isNaN(price) || price <= 0) {
      return 7;
    }
  }
  
  let resp = null;
  if (option) {
    resp = await database.addStocks(pid, stock, price, quantity);
  }
  else {
    resp = await database.sellStocks(pid, stock, price, quantity);
  }
  return resp;
}

export const checkStock = async (stock) => {
  console.log("checkStock time for " + stock);
  const stocks = await api.getAllStocks();
  console.log("received all stocks");
  const symbols = stock.split(",");

  symbols.forEach(symbol => {
    const filteredStock = stocks.filter(o => o.symbol === symbol)
    if (filteredStock.length === 0) return false;
  })

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
  if (!check) return null;

  const resp = await api.getStock(type, stocks, interval, start);
  // console.log(stocks);
  return resp;
}