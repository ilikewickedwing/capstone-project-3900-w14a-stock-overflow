/**
  This file manages all the authentication
*/

import { Database } from "./database";

/**
 * Authenticates a login and returns token and uid on success otherwise return null
 * @param {string} username 
 * @param {string} password 
 * @param {Database} database 
 * @returns {Promise<obj | null>} - returns the token of the user and uid or null if invalid
 */
export const authLogin = async (username, password, database) => {
  return null;
}

/**
 * Logouts out a user and returns whether its successful
 * @param {string} token 
 * @param {Database} database
 * @returns {Promise<boolean>}
 */
export const authLogout = async (token, database) => {
  return database.deleteToken(token);
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
  }
  const uid = await database.insertUser(username);
  await database.insertPassword(uid, password);
  const token = await database.insertToken(uid);
  return {
    uid: uid,
    token: token
  }
}