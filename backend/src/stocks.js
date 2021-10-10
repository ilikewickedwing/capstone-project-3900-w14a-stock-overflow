/**
  This file manages all stocks specific functions
*/

// import { Database } from "./database";
import fetch from "node-fetch";

export const getAllStocks = async () => {
    const stocks = [];
    const request = await fetch("https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=demo")
    let result = await request.text();
    result = result.split('\n');
    result.forEach(stock => {
        const info = stock.split(',');
        if (info[3] == "Stock") {
            stocks.push({
                symbol: info[0],
                name: info[1],
            })
        }
    });
    return stocks;
}
const result = await getAllStocks();
console.log(result);

