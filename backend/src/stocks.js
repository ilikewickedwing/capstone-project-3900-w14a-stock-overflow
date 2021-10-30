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

  if (!await checkStock(stock)) {
    return 2;
  }

  // Check for watchlist
  const get = await database.openPf(pid);
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
    resp = await database.sellStocks(pid, stock, quantity)
  }
  return resp;
}

export const checkStock = async (stock) => {
  const stocks = await alphavantage.getAllStocks();
  const filteredStocks = stocks.filter(o => o.symbol === stock);
  return filteredStocks.length !== 0;
}

/**
 * Function to retrieve stock from alphavantage
 * @param {string} stock 
 * @param {int} param
 * @returns {Promise <Object>}
 */
export const getStock = async (stock, param) => {
  const stocks = await alphavantage.getStock(stock);
  if (param == 1) return stocks[0].data.daily;
  else if (param == 2) return stocks[0].data.weekly;
  else if (param == 3) return stocks[0].data.price;
  else if (param == 4) return stocks[0].data.info;
  else return stocks;
}

/**
 * Function to retrieve stock daily data from alphavantage
 * Returns:
 *  'Meta Data':
 *    '1. Information'
 *    '2. Symbol'
 *    '3. Last Refreshed'
 *    '4. Output Size'
 *    '5. Time Zone'
 *  'Time Series (Daily)':
 *    Date:
 *      '1. open'
 *      '2. high'
 *      '3. low'
 *      '4. close'
 *      '5. volume'
 * @param {string} stock 
 * @returns {Promise <Object>}
 */
export const getStockDaily = async (stock) => {
  const stocks = await getStock(stock, 1);
  return stocks;
}

/**
 * Function to retrieve stock weekly data from alphavantage
 * Returns:
 *  'Meta Data':
 *    '1. Information'
 *    '2. Symbol'
 *    '3. Last Refreshed'
 *    '4. Time Zone'
 *  'Weekly Time Series':
 *    Date:
 *      '1. open'
 *      '2. high'
 *      '3. low'
 *      '4. close'
 *      '5. volume'
 * @param {string} stock 
 * @returns {Promise <Object>}
 */
export const getStockWeekly = async (stock) => {
  const stocks = await getStock(stock, 2);
  return stocks;
}

/**
 * Function to retrieve stock price data from alphavantage
 * Returns:
 *  'Global Quote':
 *    '01. symbol'
 *    '02. open'
 *    '03. high'
 *    '04. low'
 *    '05. close'
 *    '06. volume'
 *    '07. latest trading day'
 *    '08. previous close'
 *    '09. change'
 *    '10. change percent'
 * @param {string} stock 
 * @returns {Promise <Object>}
 */
export const getStockPrice = async (stock) => {
  const stocks = await getStock(stock, 3);
  return stocks;
}

/**
 * Function to retrieve stock information from alphavantage
 * Returns:
 *  Symbol
 *  AssetType
 *  Name
 *  Description
 *  CIK
 *  Exchange
 *  Currency
 *  Country
 *  Sector
 *  Industry
 *  Address
 *  FiscalYearEnd
 *  LatestQuarter
 *  MarketCapitalization
 *  EBITDA
 *  PERatio
 *  PEGRatio
 *  BookValue
 *  DividendPerShare
 *  DividendYield
 *  EPS
 *  RevenuePerShareTTM
 *  ProfitMargin
 *  OperatingMarginTTM
 *  ReturnOnAssetsTTM
 *  ReturnOnEquityTTM
 *  RevenueTTM
 *  GrossProfitTTM
 *  DilutedEPSTTM
 *  QuarterlyEarningsGrowthYOY
 *  QuarterlyRevenueGrowthYOY
 *  AnalystTargetPrice
 *  TrailingPE
 *  ForwardPE
 *  PriceToSalesRatioTTM
 *  PriceToBookRatio
 *  EVToRevenue
 *  EVToEBITDA
 *  Beta
 *  '52WeekHigh'
 *  '52WeekLow'
 *  '50DayMovingAverage'
 *  '200DayMovingAverage'
 *  SharesOutstanding
 *  SharesFloat
 *  SharesShort
 *  SharesShortPriorMonth
 *  ShortRatio
 *  ShortPercentOutstanding
 *  ShortPercentFloat
 *  PercentInsiders
 *  PercentInstitutions
 *  ForwardAnnualDividendRate
 *  ForwardAnnualDividendYield
 *  PayoutRatio
 *  DividendDate
 *  ExDividendDate
 *  LastSplitFactor
 *  LastSplitDate
 * @param {string} stock 
 * @returns {Promise <Object>}
 */
export const getStockInfo = async (stock) => {
  const stocks = await getStock(stock, 4);
  return stocks;
}

