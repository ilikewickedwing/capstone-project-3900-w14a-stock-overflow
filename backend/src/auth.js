/**
  This file manages all the authentication
*/

import { Database } from "./database";
import { createHash } from "crypto";

const SECRETKEY = 'StocksRcOOL';

/**
 * Encrypts a given password
 * @param {string} password 
 * @returns {string}
 */
export const encryptPassword = (password) => {
  return createHash('sha256', SECRETKEY).update(password).digest('hex');
}

/**
 * Authenticates a login and returns token and uid on success otherwise return null
 * @param {string} username 
 * @param {string} password 
 * @param {Database} database 
 * @returns {Promise<obj | null>} - returns the token of the user and uid or null if invalid
 */
export const authLogin = async (username, password, database) => {
  const uid = await database.getUid(username);
  if (uid === null) {
    return null;
  }
  // Check if password matches
  const realPassword = await database.getPassword(uid);
  if (encryptPassword(password) !== realPassword) {
    return null;
  }
  // Create a new token
  const token = await database.insertToken(uid);
  return {
    uid: uid,
    token: token
  }
}

/**
 * Logouts out a user and returns whether its successful
 * @param {string} token 
 * @param {Database} database
 * @returns {Promise<boolean>}
 */
export const authLogout = async (token, database) => {
  const value = await database.deleteToken(token);
  return value;
}

/**
 * Authenticates a register and returns a token and uid on success otherwise return null
 * @param {string} username 
 * @param {string} password 
 * @param {Database} database
 * @returns {Promise<obj | null>} - returns the token of the user and uid or null if invalid
 */
export const authRegister = async (username, password, database) => {
  const hasUsername = await database.hasUsername(username);
  if (hasUsername) {
    return null;
  } else if (username.includes(' ')) {
    return undefined;
  }
  const uid = await database.insertUser(username);
  await database.insertPassword(uid, encryptPassword(password));
  const token = await database.insertToken(uid);
  return {
    uid: uid,
    token: token
  }
}

/**
 * Deletes a user from the database and returns whether it is successful
 * @param {string} token 
 * @param {Database} database 
 * @returns {Promise<boolean>}
 */
export const authDelete = async (token, database) => {
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return false;
  }
  // Delete user
  const portfolios = await database.getPfs(uid);
  for (let i = 0; i < portfolios.length; i++) {
    await database.deletePf(uid, portfolios[i].pid);
  }
  await database.deleteUser(uid);
  await database.deletePassword(uid);
  await database.deleteAllTokensOfUser(uid);
  return true;
}