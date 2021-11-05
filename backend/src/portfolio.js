/**
  This file manages all portfolio specific functions
*/

import { Database } from "./database";
import { getStock } from "./stocks";
import schedule from "node-schedule";
import { API } from "./api.js";

export const api = new API();
export const database = new Database();

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
  // Return error if no name given
  if (name == "") {
    return 1;
  }

  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return false;
  }

  // Create the portfolio and return the result
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
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) return 1;
  
  // Return result of database function
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
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 1;
  }

  // Return result of database function
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
  // Return result of database function
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
  // Return error if name is not valid
  if (name == '') {
    return 2;
  }

  // Return error if user is not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 3;
  }

  // Return error if pid is not valid
  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return 4;
  }

  // Return error if portfolio not owned by user
  const verify = await verifyPf(uid, pid, database);
  if (!verify) return 6;

  // Return result of database function
  const update = await database.editPf(uid, pid, name);
  return update;
}

/**
 * Verifies that user owns the portfolio
 * @param {string} uid 
 * @param {string} pid 
 * @param {Database} database 
 * @returns {Promise<boolean>}
 */
export const verifyPf = async (uid, pid, database) => {
  const userPfs = await database.getPfs(uid, database);
  let check = 0;

  for (let i = 0; i < userPfs.length; i++) {
    if (userPfs[i].pid === pid) {
      check = 1;
      break;
    }
  }

  return (check === 1);
}

/**
 * Deletes portfolio from database
 * @param {string} pid 
 * @param {Database} database 
 * @returns {Promise<boolean>}
 */
export const deletePf = async (token, pid, database) => {
  // Return error if user is not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 2;
  }

  // Return error if pid is not valid
  // Return error if pid belongs to watchlist
  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return 3;
  } else if (Pf.name == "Watchlist") {
    return 4;
  }

  // Return error if portfolio not owned by user
  const verify = await verifyPf(uid, pid, database);
  if (!verify) return -1;

  // Return result of database function
  const del = await database.deletePf(uid, pid);
  return del;
}

/**
 * Function to calculate the performance of a portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {Database} database 
 * @returns 
 */
export const calcPf = async (token, pid, database, admin) => {
  const now = new Date();
  const today = new Date(now);
  const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  const date = time.toString();

  // Check if command being issued by admin
  if (master !== 'yes') {
    // Return error if user is not found
    const uid = await database.getTokenUid(token);
    if (uid == null) {
      return -2;
    }

    // Return error if pid is not valid
    // Return error if pid belongs to watchlist
    const Pf = await database.openPf(pid);
    if (Pf == null) {
      return -3;
    } else if (Pf.name == "Watchlist") {
      return -4;
    }

    // Return error if portfolio not owned by user
    const verify = await verifyPf(uid, pid, database);
    if (!verify) return -1;
  }

  // Check if the market day has closed yet and if the performance has been calculated
  // If both are no, then calculate the new performance
  // If either are yes, return the most recent submission

  const status = await api.marketStatus();
  const pfPerf = Pf.value.performance;

  // If the market is open, then return yesterday's performance
  // Else if it is the same day and it has been calculated already, return it
  // Otherwise, calculate the performance
  if (!status) return pfPerf[pfPerf.length - 1];
  else {
    if(pfPerf[pfPerf.length - 1].date === date) return pfPerf[pfPerf.length - 1];
  }
  

  // Calculate performance of portfolio
  // Add in actual sold profit with current value or portfolio
  //  versus the amount invested in portfolio
  let perf = 0;
  let gain = Pf.value.sold;

  // Get stocklist
  const stocks = Pf.stocks;
  for (let i = 0; i < stocks.length; i++) {
    // Add up the current price of each stock to determine current value and add to stock list
    const symbol = stocks[i].stock;
    const values = await getStock(1, symbol);
    const price = values.data.quotes.quote['last'];
    const value = price * stocks[i].quantity;
    const spent = stocks[i].avgPrice * stocks[i].quantity;
    const amt = (value - spent)/spent;
    stocks[i].performance.push({ date: date, performance: amt });
    gain += value;
  }


  // Calculate profit as a percentage
  const profit = gain - Pf.value.spent;
  perf = profit/Pf.value.spent;

  // Add performance history to portfolio array
  Pf.value.performance.push({ date: date, performance: perf });

/*   console.log(Pf);
  
  for (let i = 0; i < stocks.length; i++) {
    const stockPerf = stocks[i].performance;
    console.log('Performance for ' + stocks[i].stock + ' is:');
    console.log(stockPerf);
  }

  console.log(Pf.value.performance); */

  const update = await database.calcPf(pid, Pf.value, Pf.stocks);

  if (!update) return -5;

  return perf;
}

const calcAll = async () => {
  // const rule = new schedule.RecurrenceRule();
  // rule.hour = 16;
  // rule.tz = 'Etc/UTC';

  // const job = schedule.scheduleJob(rule, function() {
  //   console.log('Market is now closed. Portfolio calculation has begun.');
  //   const portfolios = database.collection('portfolios');
  //   for (let i = 0; i < portfolios.length; i++) {
  //     calcPf(null, portfolios[i].pid, database, 'yes');
  //   }
  // })

  const job = schedule.scheduleJob('0 * * * * *', function() {
    console.log('A new minute has started.');
    test();
  })
}

const test = () => {
  console.log('Hello world!');
}