/**
  This file manages all portfolio specific functions
*/

import { Database } from "./database";
import { getStock } from "./stocks";
import { verifyPf } from "./portfolio";
import * as schedule from "node-schedule";
import { API } from "./api";

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
  if (Pf.name == "Watchlist") {
    return -4;
  }

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
    if (stocks === []) return 0;
    for (let i = 0; i < stocks.length; i++) {
      // Add up the current price of each stock to determine current value and add to stock list
      const symbol = stocks[i].stock;
      const values = await getStock(1, symbol);
      const price = values.data.quotes.quote['last'];
      const value = price * stocks[i].quantity;
      const spent = stocks[i].avgPrice * stocks[i].quantity;
      const amt = (value - spent)/spent * 100;
      stocks[i].performance.push({ date: date, performance: amt });
      gain += value;
    }


    // Calculate profit as a percentage
    const profit = gain - Pf.value.spent;
    perf = profit/Pf.value.spent * 100;
    let prevVal = null;
    let prevPerc = null;

    // Add performance history to portfolio array
    const prevPerf = Pf.value.performance[Pf.value.performance.length - 1];
    if (prevPerf) {
      prevVal = prevPerf.money;
      prevPerc = prevPerf.performance;
    } else {
      prevVal = 0;
      prevPerc = 0;
    }
    Pf.value.performance.push({ date: date, performance: perf, money: profit });
    const change = profit - prevVal;
    const changePerc = perf - prevPerc;
    Pf.value.change.push({ date: date, percentage: changePerc, money: change });

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

    if (testDate === 'today') {
      // console.log('Performing calcution for today: ' + date);
      let perf = 0;
      let gain = Pf.value.sold;
      
      const stocks = Pf.stocks;
      if (stocks === []) return 0;
      for (let i = 0; i < stocks.length; i++) {
        // Add up the current price of each stock to determine current value and add to stock list
        const symbol = stocks[i].stock;
        const values = await getStock(1, symbol);
        const price = values.data.quotes.quote['last'];
        const value = price * stocks[i].quantity;
        const spent = stocks[i].avgPrice * stocks[i].quantity;
        const amt = (value - spent)/spent * 100;
        stocks[i].performance.push({ date: date, performance: amt });
        gain += value;
      }

      const profit = gain - Pf.value.spent;
      perf = profit/Pf.value.spent * 100;

      let prevVal = null;
      let prevPerc = null;

      // Add performance history to portfolio array
      const prevPerf = Pf.value.performance[Pf.value.performance.length - 1];
      if (prevPerf) {
        prevVal = prevPerf.money;
        prevPerc = prevPerf.performance;
      } else {
        prevVal = 0;
        prevPerc = 0;
      }
      Pf.value.performance.push({ date: date, performance: perf, money: profit });
      const change = profit - prevVal;
      const changePerc = perf - prevPerc;
      Pf.value.change.push({ date: date, percentage: changePerc, money: change });
      await database.calcPf(pid, Pf.value, Pf.stocks);
      return;
    }

    // console.log('Performing calcution for ' + testDate + ' and the following ' + testDays + ' days');

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
        Pf.value.change.splice(0, 1);
      }
      let prevVal = null;
      let prevPerc = null;
      // console.dir(Pf, {depth:null});
      const prevPerf = Pf.value.performance[Pf.value.performance.length - 1];
      if (prevPerf) {
        prevVal = prevPerf.money;
        prevPerc = prevPerf.performance;
      } else {
        prevVal = 0;
        prevPerc = 0;
      }
      Pf.value.performance.push({ date: setDate, performance: perf, money: profit });
      const change = profit - prevVal;
      const changePerc = perf - prevPerc;
      Pf.value.change.push({ date: setDate, percentage: changePerc, money: change });
    }

    await database.calcPf(pid, Pf.value, Pf.stocks);

    return;
  }
}

/**
 * Function that calculates all portfolio performances for that day
 * @param {Database} database 
 */
export const calcAll = async (database, testmode) => {
  const rule1 = new schedule.RecurrenceRule();
  rule1.hour = 16;
  rule1.tz = 'US/Eastern';

  const job = schedule.scheduleJob(rule1, async () => {
    console.log('Market is now closed. Portfolio calculation has begun.');
    const portfolios = await database.getAllPfs();
    for (let i = 0; i < portfolios.length; i++) {
      await calcPf(null, portfolios[i].pid, database, 'yes');
    }

    await rankAll(database);
  })

  if (testmode === true) {
    console.log('Testing calcAll function');

    const now = new Date();
    const test = new Date(now);
    test.setSeconds(now.getSeconds() + 1);
    console.log('Running at ' + now + ', with test scheduled for ' + test);

    
    const job = schedule.scheduleJob(test, async () => {
      console.log('Test calcAll running');
      const portfolios = await database.getAllPfs();
      for (let i = 0; i < portfolios.length; i++) {
        // const stocks = await database.openPf(portfolios[i].pid);
        // console.dir(stocks, {depth:null});
        await calcPf(null, portfolios[i].pid, database, 'yes', 'yes', 'today', 1);
        // const stocks1 = await database.openPf(portfolios[i].pid);
        // console.dir(stocks1, {depth:null});
      }
      
      await rankAll(database);
    })
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
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
      const percentage = await database.setUserPerf(users[i].uid, avgPerf);
      // console.log('rank is ' + (rank + 1) + ', uid is ' + users[i].uid + ', name is ' + users[i].username + ', avgPerf is ' + avgPerf);
      rankings.push({ rank: null, uid: users[i].uid, name: users[i].username, performance: { performance: percentage, money: avgPerf.money }});
    } 
  }

  const newRank = mergeSort(rankings);

  for (let i = 0; i < newRank.length; i++) {
    newRank[i].rank = i + 1;
  }

  console.dir(newRank, {depth:null});

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
      if (left[0].performance.performance >= right[0].performance.performance) {
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
  let totalSpend = 0;
  let totalSold = 0;
  for (let i = 0; i < pfs.length; i++) {
    const pf = await database.openPf(pfs[i].pid);
    if (pf.name !== 'Watchlist') {
      // console.dir(pf, { depth: null });
      const performances = pf.value.performance;
      const perf = performances[performances.length - 1].money;
      total += perf;
      totalSpend += pf.value.spent;
      totalSold += pf.value.sold;
    }
  }

  return { 
    money: total,
    spent: totalSpend,
    sold: totalSold
  };
}

export const getAllRankings = async (database) => {
  const rankings = await database.getRankings();
  return rankings;
}

// We tried and we failed
// export const getFriendRankings1 = async (token, database) => {
//   // console.log('FriendRankings1');
//   const global = await getAllRankings(database);
//   // console.dir(global, {depth:null});
//   // Return error if user is not found
//   const uid = await database.getTokenUid(token);
//   if (uid == null) {
//     return -2;
//   }

//   const friends = await database.getFriends(uid);
//   // console.log('Friends are ' + friends);
//   const friendRank = [];
//   for (let i = 0; i < friends.length; i++) {
//     // console.log('Now searching for ' + friends[i]);
//     for (let j = 0; j < global.length; j++) {
//       // console.log('Comparing against ' + global[j].uid);
//       if (friends[i] === global[j].uid) {
//         // console.log('Found!');
//         friendRank.push({
//           rank: i+1,
//           uid: friends[i],
//           name: global[j].name,
//           performance: global[j].performance
//         })
//         // console.dir(friendRank, {depth:null});
//       }
//     }
//   }

//   for (let i = 0; i < friendRank.length; i++) {
//     friendRank[i].rank = i + 1;
//   }

//   // Filter through friends list
//   return friendRank;
// }

export const getFriendRankings = async (token, database) => {
  // console.log('FriendRankings');
  // Return error if user is not found
  const uid = await database.getTokenUid(token);
  if (uid == null) {
    return -2;
  }
  const friends = await database.getFriends(uid);
  // console.dir(friends, {depth : null});
  const friendPerf = [];
  for (let i = 0; i < friends.length; i++) {
    // console.dir(friends[i], {depth : null});
    const friend = await database.getUserPerf(friends[i].uid);
    // console.log(friend);
    friendPerf.push({
      rank: 0,
      uid: friends[i].uid,
      name: friend.name,
      performance: {
        performance: friend.performance[friend.performance.length - 1].performance,
        money: friend.performance[friend.performance.length - 1].money,
      }
    })
    // console.dir(friendPerf, {depth:null});
  }

  const self = await database.getUserPerf(uid);
  friendPerf.push({
    rank: 0,
    uid: uid,
    name: self.name,
    performance: {
      performance: self.performance[self.performance.length - 1].performance,
      money: self.performance[self.performance.length - 1].money,
    }
  })

  const friendRank = mergeSort(friendPerf);
  for (let i = 0; i < friendRank.length; i++) {
    friendRank[i].rank = i + 1;
  }

  // Filter through friends list
  return friendRank;
}

export const getUserPerf = async (token, uid, database) => {
  // console.log('FriendRankings');
  // Return error if user is not found
  const userUid = await database.getTokenUid(token);
  if (userUid == null) {
    return 1;
  }

  if (userUid !== uid) {
    if (!await database.checkFriend(userUid, uid)) {
      const celebrities = await database.getAllCelebrityUsers();
      const filtered = celebrities.filter((e) => e.uid === uid);
      if (filtered.length === 0) {
        return 2;
      }
    }
  }

  const perf = await database.getUserPerf(uid);
  return perf;
}