/**
  This is a program to generate mock values into the database
*/
import fetch from "node-fetch";
import fs from 'fs';
import axios from 'axios';

// This is the port number of the backend server
const ENDPOINT = `http://localhost:5050`;

// The number of users to register (including celebrities but not the default admin)
// This number must be greater than the number of celebrities plus the number
// of celebrity requests (because only users can request to be celebrities)
const USERNUM = 100;
let userInfo = [];
// userInfo: {
// 	userNum: int,
// 	token: token,
// 	uid: uid
// }
let pids = [];
// pids: {
// 	user: uid,
// 	pid: pid
// }
let daysCalced = 0;
const now = new Date();
const today = new Date(now);
const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
const date = time.toString();

// Number of users requesting to be a celebrity
const CELEBRITYREQUESTS = 10;

// Number of celebrities (must be smaller than the number of users)
const CELEBRITIES = 10;



const generateMockData = async () => {
  // let users = await registerUsers(USERNUM);
  // users = await makeCelebrities(users, CELEBRITIES);
  await loadUsers();
  await loadCeleb();
  await makeFriends();
	await setDefBroker();
	await createPfs();
	await addStocks();
	await calcPf();
	await calcAll();
	await addMoreStocks();
	await reCalcPf();
	await calcAll();
}

/**
 * Registers the given number of users and returns
 * an array of their user data.
 * Users are in the following form:
 *   {
 *     uid: string,
 *     username: string,
 *     password: string,
 *     userType: string,
 *   }
 * @param {number} numberOfUsers 
 * @returns {array}
 */
const registerUsers = async (numberOfUsers) => {
  // Api that returns random user information
  const resp = await fetch(`https://randomuser.me/api/?results=${numberOfUsers}`);
  const respJson = await resp.json();
  const outputUsers = [];
  // Register all the users
  for (const user of respJson.results) {
    try {
      const registerResp = await fetch(`${ENDPOINT}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
          username: user.login.username,
          password: user.login.password,
        })
      });
      // Get uid
      const registerRespJson = await registerResp.json();
      // Add to users list
      outputUsers.push({
        uid: registerRespJson.uid,
        username: user.login.username,
        password: user.login.password,
        userType: 'user',
      })
    } catch (err) {
      throw err;
    }
  }
  return outputUsers;
}

const users = [
  {
    username: "user1",
    password: "user1"
  }, {
    username:"user2", 
    password:"user2"
  }, {
    username:'celeb',
    password:'celeb'
  }
]

// register users 
const loadUsers = async () => {
  for (let i= 0; i < 3; i++){
    try{
      const rego = await axios.post(`${ENDPOINT}/auth/register`,{username: users[i].username, password: users[i].password});
			// console.dir(rego.data, {depth:null});
			userInfo.push({
				userNum: i,
				token: rego.data.token,
				uid: rego.data.uid
			})
    } catch (e) {
      console.log(e);
    }
  } 
}

// make celeb = celeb acc
const loadCeleb = async () => {
  try { 
    // log in to admin acc 
    const resp = await axios.post(`${ENDPOINT}/auth/login`,{username: 'admin', password:'admin'});
    const adminToken = resp.data.token;
    // make celeb
    await axios.post(`${ENDPOINT}/user/profile`,{uid:userInfo[2].uid, token: adminToken, userData:{userType:"celebrity"}});
  } catch (e) {
    console.log(e); 
  }
}

// make user1 friend with user2 
const makeFriends = async () => {
  const token = userInfo[0].token;
  const friendID = userInfo[1].uid;
  try {
    const resp = await axios.post(`${ENDPOINT}/friends/add`,{token, friendID});
  } catch (e) {
    console.log(e);
  }
}

const setDefBroker = async () => {
	await axios.post(`${ENDPOINT}/user/setDefBroker`,{
		token: userInfo[0].token,
		defBroker: '5',
		brokerFlag: '1'
	})
	await axios.post(`${ENDPOINT}/user/setDefBroker`,{
		token: userInfo[1].token,
		defBroker: '0',
		brokerFlag: '0'
	})
	await axios.post(`${ENDPOINT}/user/setDefBroker`,{
		token: userInfo[2].token,
		defBroker: '50',
		brokerFlag: '0'
	})
}

// User1 - AAPL, AMZN, IBM
// User2 - NVDA, MSFT, FB
const createPfs = async () =>{
	const resp1 = await axios.post(`${ENDPOINT}/user/portfolios/create`,{
		token: userInfo[0].token,
		name: 'myPf'
	})
	// console.dir(resp1, {depth:null});
	pids.push({
		user: userInfo[0].uid,
		pid: resp1.data.pid,
	})
	const resp2 = await axios.post(`${ENDPOINT}/user/portfolios/create`,{
		token: userInfo[1].token,
		name: 'myPf'
	})
	pids.push({
		user: userInfo[1].uid,
		pid: resp2.data.pid,
	})
	const resp3 = await axios.post(`${ENDPOINT}/user/portfolios/create`,{
		token: userInfo[2].token,
		name: 'myPf'
	})
	pids.push({
		user: userInfo[2].uid,
		pid: resp3.data.pid,
	})
	const resp4 = await axios.post(`${ENDPOINT}/user/portfolios/create`,{
		token: userInfo[2].token,
		name: 'myPf2'
	})
	pids.push({
		user: userInfo[2].uid,
		pid: resp4.data.pid,
	})
}

const addStocks = async () => {
	console.log('addStocks');
	daysCalced = 10;
	const test = new Date();
	test.setDate(today.getDate() - daysCalced);
	const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);

	let values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=AAPL&interval=daily&start=${testDate}`);
	let price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[0].token, 
		pid: pids[0].pid, 
		stock: 'AAPL', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[1].token, 
		pid: pids[1].pid, 
		stock: 'AAPL', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[2].pid, 
		stock: 'AAPL', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	
	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=NVDA&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[3].pid, 
		stock: 'NVDA', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})

	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=AMZN&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[0].token, 
		pid: pids[0].pid, 
		stock: 'AMZN', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[1].token, 
		pid: pids[1].pid, 
		stock: 'AMZN', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[2].pid, 
		stock: 'AMZN', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	
	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=MSFT&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[3].pid, 
		stock: 'MSFT', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})

	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=IBM&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[0].token, 
		pid: pids[0].pid, 
		stock: 'IBM', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[1].token, 
		pid: pids[1].pid, 
		stock: 'IBM', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[2].pid, 
		stock: 'IBM', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	
	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=FB&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[3].pid, 
		stock: 'FB', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
}

const calcPf = async() => {
	console.log('calcPf');
	// testDate - the date from which portfolio calculations begin
	// testDays - the number of days calculated for
	const test = new Date();
	test.setDate(today.getDate() - daysCalced);
	const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);
	const testDays = 3;
	
	await axios.post(`${ENDPOINT}/rankings/forceCalcPf`,{
		token: userInfo[0].token, 
		pid: pids[0].pid, 
		testDate: testDate,
		testDays: testDays,
	})
	await axios.post(`${ENDPOINT}/rankings/forceCalcPf`,{
		token: userInfo[1].token, 
		pid: pids[1].pid, 
		testDate: testDate,
		testDays: testDays,
	})
	await axios.post(`${ENDPOINT}/rankings/forceCalcPf`,{
		token: userInfo[2].token, 
		pid: pids[2].pid, 
		testDate: testDate,
		testDays: testDays,
	})
	await axios.post(`${ENDPOINT}/rankings/forceCalcPf`,{
		token: userInfo[2].token, 
		pid: pids[3].pid, 
		testDate: testDate,
		testDays: testDays,
	})
	daysCalced -= testDays;
}

const calcAll = async () => {
	console.log('calcAll');
  try{
    await axios.post(`${ENDPOINT}/rankings/forceCalc`);
  }catch (e){
    console.log(e);
  }
}

const addMoreStocks = async () => {
	const test = new Date();
	test.setDate(today.getDate() - daysCalced);
	const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);

	let values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=AAPL&interval=daily&start=${testDate}`);
	let price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[0].token, 
		pid: pids[0].pid, 
		stock: 'AAPL', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[1].token, 
		pid: pids[1].pid, 
		stock: 'AAPL', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[2].pid, 
		stock: 'AAPL', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	
	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=NVDA&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[3].pid, 
		stock: 'NVDA', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})

	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=AMZN&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[0].token, 
		pid: pids[0].pid, 
		stock: 'AMZN', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[1].token, 
		pid: pids[1].pid, 
		stock: 'AMZN', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[2].pid, 
		stock: 'AMZN', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	
	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=MSFT&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[3].pid, 
		stock: 'MSFT', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})

	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=IBM&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[0].token, 
		pid: pids[0].pid, 
		stock: 'IBM', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[1].token, 
		pid: pids[1].pid, 
		stock: 'IBM', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[2].pid, 
		stock: 'IBM', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
	
	values = await axios.get(`${ENDPOINT}/stocks/info?type=2&stocks=FB&interval=daily&start=${testDate}`);
	price = values.data.data.history.day[0].close;
	await axios.post(`${ENDPOINT}/user/stocks/add`,{
		token: userInfo[2].token, 
		pid: pids[3].pid, 
		stock: 'FB', 
		price: price, 
		quantity: 2, 
		brokerage: null, 
		brokerFlag: null
	})
}

const reCalcPf = async() => {
	console.log('calcPf');
	// testDate - the date from which portfolio calculations begin
	// testDays - the number of days calculated for
	const test = new Date();
	test.setDate(today.getDate() - daysCalced);
	const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);
	const testDays = 3;
	
	await axios.post(`${ENDPOINT}/rankings/forceCalcPf`,{
		token: userInfo[0].token, 
		pid: pids[0].pid, 
		testDate: testDate,
		testDays: testDays,
	})
	await axios.post(`${ENDPOINT}/rankings/forceCalcPf`,{
		token: userInfo[1].token, 
		pid: pids[1].pid, 
		testDate: testDate,
		testDays: testDays,
	})
	await axios.post(`${ENDPOINT}/rankings/forceCalcPf`,{
		token: userInfo[2].token, 
		pid: pids[2].pid, 
		testDate: testDate,
		testDays: testDays,
	})
	await axios.post(`${ENDPOINT}/rankings/forceCalcPf`,{
		token: userInfo[2].token, 
		pid: pids[3].pid, 
		testDate: testDate,
		testDays: testDays,
	})
	daysCalced -= testDays;
}

/**
 * Given an array of registered users, make the first N (numberOfCelebrities) users
 * into a celebrity
 * @param {array} users 
 * @param {number} numberOfCelebrities 
 * @returns {array}
 */
const makeCelebrities = async (users, numberOfCelebrities) => {
  // Login to admin account
  const loginResp = await fetch(`${ENDPOINT}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin',
    })
  });
  const loginRespJson = await loginResp.json();
  const adminToken = loginRespJson.token;
  // Make the first N users a celebrity
  for (let i = 0; i < numberOfCelebrities; i++) {
    // Change the usertype to admin
    await fetch(`${ENDPOINT}/user/profile`, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        uid: users[i].uid,
        token: adminToken,
        userData: {
          userType: 'celebrity'
        }
      })
    });
    users[i].userType = 'celebrity';
  }
  return users;
}

// /**
//  * Make a request to become a celebrity for the last N users
//  * @param {*} users 
//  * @param {*} numberOfRequests 
//  */
// const makeCelebrityRequests = async (users, numberOfRequests) => {
//   // Get mock license
//   const data = await fs.promises.readFile('./assets/license.jpg', 'utf8');
//   for (let i = 0; i < numberOfRequests; i++) {
//     const userData = users[users.length - i];
    
//   }
// }

generateMockData();