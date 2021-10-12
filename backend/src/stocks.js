/**
  This file manages all stocks specific functions
*/

import { Database } from "./database.js";
import axios from "axios";
import { Alphavantage } from "./alphavantage.js";

export const alphavantage = new Alphavantage();

/**
 * Gets a list of active stocks
 * @returns {Promise <[{symbol: String, name: String}]>}
 * A list of stocks with their symbol and name
 * 
 */
export const getAllStocks = async () => {
    const resp = await alphavantage.getAllStocks();
    return resp;
}

/**
 * Adds a stock to a portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {string} stock 
 * @param {float} price 
 * @param {int} amount 
 * @param {Database} database
 * @returns {Promise <boolean>}
 */
export const addStock = async (token, pid, stock, price, amount, database) => {
    // Finding corresponding user for the given token
    const uid = await database.getTokenUid(token);
    if (uid === null) {
        return false;
    }

    if (!await checkStock(stock)) {
        return false;
    }

    const resp = await database.addStocks(pid, stock, price, amount);
    if (resp !== null) {
        return resp;
    }
    return false;
}

/**
 * Modifies an existing stock inside the portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {string} stock 
 * @param {float} price 
 * @param {int} amount 
 * @param {int} option 0 = sell, anything else = buy
 * @param {Database} database
 * @returns {Promise <boolean>}
 */
export const modifyStock = async (token, pid, stock, price, amount, option, database) => {
    // Finding corresponding user for the given token
    const uid = await database.getTokenUid(token);
    if (uid === null) {
        return false;
    }

    if (!await checkStock(stock)) {
        return false;
    }
    
    let resp = null;
    if (option) {
        resp = await database.addStocks(pid, stock, price, amount);
    }
    else {
        resp = await database.sellStocks(pid, stock, amount)
    }
    if (resp !== null) {
        return resp;
    }
    return false;
}

export const checkStock = async (stock) => {
    const stocks = await alphavantage.getAllStocks();
    const filteredStocks = stocks.filter(o => o.symbol === stock);
    return filteredStocks.length !== 0;
}