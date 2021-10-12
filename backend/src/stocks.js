/**
  This file manages all stocks specific functions
*/

import { Database } from "./database.js";
import axios from "axios";
const apikey = "demo";

/**
 * Gets a list of active stocks
 * @returns {Promise <[{symbol: String, name: String}]>}
 * A list of stocks with their symbol and name
 * 
 */
export const getAllStocks = async () => {
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
    return stocks;
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
        return 1;
    }

    if (!await checkStock(stock)) {
        return 2;
    }

    const resp = await database.addStocks(pid, stock, price, amount);
    return resp;
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
        return 1;
    }

    if (!await checkStock(stock)) {
        return 2;
    }
    
    let resp = null;
    if (option) {
        resp = await database.addStocks(pid, stock, price, amount);
    }
    else {
        resp = await database.sellStocks(pid, stock, amount)
    }
    return resp;
}

export const checkStock = async (stock) => {
    const resp = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock}&apikey=WP9NF0YE83L4FABK`);
    if (resp.data['Error Message']) {
        return false;
    }
    return true;
}