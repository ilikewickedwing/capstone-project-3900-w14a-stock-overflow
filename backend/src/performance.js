/**
  This file manages all portfolio specific functions
*/

import { Database } from "./database";
import { getStock } from "./stocks";
import { verifyPf } from "./portfolio";
import * as schedule from "node-schedule";
import { API } from "./api";
import { database } from ".";

const api = new API(); 


/**
 * Function to calculate the performance of a portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {Database} database 
 * @returns 
 */
export const calcPf = async (token, pid, database, admin, test, testDate, testDays) => {
const now = new Date();
const today = new Date(now);
const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
const date = time.toString();
const Pf = await database.openPf(pid);

  // Check if command being issued by admin
  if (admin !== 'yes') {
    // Return error if user is not found
    const uid = await database.getTokenUid(token);
    if (uid == null) {
    return -2;
    }

    // Return error if pid is not valid
    // Return error if pid belongs to watchlist
    if (Pf === null) {
    return -3;
    } else if (Pf.name == "Watchlist") {
    return -4;
    }
    
    // Return error if portfolio not owned by user
    const verify = await verifyPf(uid, pid, database);
    if (!verify) return -1;
  }

  if (test !== 'yes') {
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
    // Add in actual sold profit with current value of portfolio
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
  } else {
    // Date to be calculated is testDate
    // Amount of days to be calculated is testDays

    // Get stocklist
    const stocks = Pf.stocks;
    // console.log(stocks);
    let deetArray = [];
    for (let i = 0; i < stocks.length; i++) {
      const symbol = stocks[i].stock;
      const values = await getStock(2, symbol, 'daily', testDate);
      const deets = values.data.history.day;
      deetArray.push(deets);
    }

    
    // For each day
    for (let k = 0; k < Math.min(deetArray[0].length, testDays); k++) {
      let perf = 0;
      let gain = Pf.value.sold;

      let setDate = null;
      

      for (let l = 0; l < deetArray.length; l++) {
        setDate = deetArray[l][k].date;
        const price = deetArray[l][k].close;
        const value = price * stocks[l].quantity;
        const spent = stocks[l].avgPrice * stocks[l].quantity;
        const amt = (value - spent)/spent * 100;
        if (stocks[l].performance[0].date === date) {
          stocks[l].performance.splice(0, 1);
        }
        stocks[l].performance.push({ date: setDate, performance: amt });
        gain += value;
      }


      const profit = gain - Pf.value.spent;
      perf = profit/Pf.value.spent * 100;
  
      // Add performance history to portfolio array
      if (Pf.value.performance[0].date === date) {
        Pf.value.performance.splice(0, 1);
      }
      Pf.value.performance.push({ date: setDate, performance: perf });
    }

    await database.calcPf(pid, Pf.value, Pf.stocks);

    return;
  }
}

/**
 * Function that calculates all portfolio performances for that day
 * @param {Database} database 
 */
export const calcAll = async (database) => {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 16;
  rule.tz = 'US/Eastern';

  const job = schedule.scheduleJob(rule, function() {
    console.log('Market is now closed. Portfolio calculation has begun.');
    const portfolios = database.collection('portfolios');
    for (let i = 0; i < portfolios.length; i++) {
      calcPf(null, portfolios[i].pid, database, 'yes');
    }

    rankAll(database);
  })
}

/**
 * Functions that ranks all users based on performance
 * @param {Database} database 
 */
export const rankAll = async (database) => {
  let rankings = [];
  const users = await database.getAllUsers();
  for (let i = 0; i < users.length; i++) {
    // console.dir(users[i], {depth:null});
    if (users[i].userType !== 'admin') {
      const pfs = await database.getPfs(users[i].uid);
      const avgPerf = await rankOne(pfs, database);
      await database.setUserPerf(users[i].uid, avgPerf);
      // console.log('rank is ' + (rank + 1) + ', uid is ' + users[i].uid + ', name is ' + users[i].username + ', avgPerf is ' + avgPerf);
      rankings.push({ rank: null, uid: users[i].uid, name: users[i].username, performance: avgPerf });
      rank++;
    } 
  }

  const newRank = mergeSort(rankings);

  for (let i = 0; i < newRank.length; i++) {
    newRank[i].rank = i + 1;
  }

  await database.updateRankings(newRank);
}

const mergeSort = (arr) => {
    if (arr.length < 2)
        return arr;

    var middle = parseInt(arr.length / 2);
    var left   = arr.slice(0, middle);
    var right  = arr.slice(middle, arr.length);

    return merge(mergeSort(left), mergeSort(right));
}

const merge = (left, right) => {
  var result = [];

  while (left.length && right.length) {
      if (left[0].performance >= right[0].performance) {
          result.push(left.shift());
      } else {
          result.push(right.shift());
      }
  }

  while (left.length)
      result.push(left.shift());

  while (right.length)
      result.push(right.shift());

  return result;
}

/**
 * Function that calculates performance for user and updates it in database
 * @param {Array<Object>} pfs 
 * @param {Database} database 
 * @returns performance as float
 */
const rankOne = async (pfs, database) => {
  let total = 0;
  for (let i = 0; i < pfs.length; i++) {
    const pf = await database.openPf(pfs[i].pid);
    if (pf.name !== 'Watchlist') {
      // console.dir(pf, { depth: null });
      const performances = pf.value.performance;
      const perf = performances[performances.length - 1].performance;
      total += perf;
    }
  }

  return (total/pfs.length);
}

const getRankings = async (database) => {
  const rankings = await database.getRankings();
  return rankings;
}