/**
  This file manages all stocks specific functions
*/

// import { Database } from "./database";
import fetch from "node-fetch";
import { database } from ".";
const apikey = "demo";

/**
 * Gets a list of active stocks
 * @returns A list of stocks with their symbol and name
 * Return type is : [{symbol: String, name: String}]
 */
export const getAllStocks = async () => {
    const stocks = [];

    // Fetching the list of active stocks
    const request = await fetch(`https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${apikey}`);
    let result = await request.text();  // Converting result into text
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
 * @returns 
 */
export const addStock = async (token, pid, stock, price, amount, database) => {
    // Finding corresponding user for the given token
    const uid = await database.getTokenUid(token);
    if (uid === null) {
        return false;
    }

    const resp = await database.addStocks(pid, stock, price, amount);
    if (resp !== null) {
        return resp;
    }
    return null;
}

/**
 * Modifies an existing stock inside the portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {string} stock 
 * @param {float} price 
 * @param {int} amount 
 * @param {int} option 0 = sell, 1 = add
 * @returns 
 */
export const modifyStock = async (token, pid, stock, price, amount, option, database) => {
    // Finding corresponding user for the given token
    const uid = await database.getTokenUid(token);
    if (uid === null) {
        return false;
    }
    const resp = null;
    if (option) {
        resp = await database.addStocks(pid, stock, price, amount);
    }
    else {
        resp = await database.sellStocks(pid, stock, amount)
    }
    if (resp !== null) {
        return resp;
    }
    return null;
}