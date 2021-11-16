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

// Number of users requesting to be a celebrity
const CELEBRITYREQUESTS = 10;

// Number of celebrities (must be smaller than the number of users)
const CELEBRITIES = 10;



const generateMockData = async () => {
  let users = await registerUsers(USERNUM);
  users = await makeCelebrities(users, CELEBRITIES);
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
    password:'celeb
  }
]


const loadUsers = async () => {
  for (let i= 0; i < 3; i++){
    await axios.post(`${ENDPOINT}/auth/register`,{username: username[i], password: password[i]});
  } 
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