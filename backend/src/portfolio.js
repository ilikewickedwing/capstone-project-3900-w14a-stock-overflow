/**
  This file manages all portfolio specific functions
*/

import { Database } from "./database";
import { getStockPrice } from "./stocks";

/**
 * Creates a new portfolio for the user
 * Returns portfolio as object in form:
 * {
 *   pid :string,
 *   name: string,
 * }
 * Otherwise returns null if new portfolio not created
 * @param {string} token 
 * @param {string} name 
 * @param {Database} database 
 * @returns {Promise<Pfs | null>}
 */
export const createPf = async (token, name, database) => {
  if (name == "") {
    return 1;
  }

  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return false;
  }

  const pidResp = await database.insertPf(uid, name);
  if (pidResp !== null) {
    const obj = { pid: pidResp };
    return obj;
  }
  return null;
}

/**
 * Gets the portfolios for the user
 * Returns portfolio as array with object in form:
 * {
 *   pid: string,
 *   name: string,
 * }
 * @param {string} token
 * @param {Database} database
 * @returns {Promise<array>}
 */
export const userPfs = async (token, database) => {
  const uid = await database.getTokenUid(token);
  if (uid === null) return 1;
  
	const userPf = await database.getPfs(uid);
  return userPf;
}

/**
 * Gets the id of a portfolio given token and name
 * @param {string} token
 * @param {string} name 
 * @param {Database} database 
 * @returns {Promise<string | null>}
 */
export const getPid = async (token, name, database) => {
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return false;
  }

  const pid = await database.getPid(uid, name);
  return pid;
}

/**
 * Gets all the information contained in a portfolio
 * Returns null if portfolio does not exist
 * @param {string} pid 
 * @param {Database} database 
 * @returns {Promise<Object>}
 */
export const openPf = async (pid, database) => {
  const Pf = await database.openPf(pid);
  return Pf;
}

/**
 * Allows the user to edit the portfolio name
 * Returns null if portfolio does not exist
 * @param {string} token 
 * @param {string} pid 
 * @param {string} name 
 * @param {Database} database 
 * @returns 
 */
export const editPf = async (token, pid, name, database) => {
  if (name == '') {
    return 2;
  }

  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 3;
  }

  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return 4;
  }

  const update = await database.editPf(uid, pid, name);
  return update;
}

/**
 * Deletes portfolio from database
 * @param {string} pid 
 * @param {Database} database 
 * @returns {Promise<boolean>}
 */
export const deletePf = async (token, pid, database) => {
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 2;
  }

  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return 3;
  } else if (Pf.name == "Watchlist") {
    return 4;
  }
  // Delete portfolio
  const del = await database.deletePf(uid, pid);
  return del;
}

export const calcPf = async (token, pid, database) => {
  const uid = await database.getTokenUid(token);
  if (uid == null) {
    return -2;
  }

  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return -3;
  } else if (Pf.name == "Watchlist") {
    return -4;
  }

  let perf = 0;
  // Calculate profit so far
  let gain = Pf.value.sold;

  const stocks = Pf.stocks;
  for (let i = 0; i < stocks.length; i++) {
    const symbol = stocks[i].stock;
    const value = await getStockPrice(symbol);
    const price = value.data['Global Quote']['05. price'];
    console.log(stocks[i].stock + " currently valued at " + price);
    gain += price * stocks[i].quantity;
  }

  const profit = gain - Pf.value.spent;
  perf = profit/Pf.value.spent;

  return perf;
}