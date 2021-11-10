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
 export const calcPf = async (token, pid, database, admin) => {
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
	})
  }