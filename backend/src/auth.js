/**
  This file manages all the authentication
*/

import { Database } from "./database";

/**
 * Authenticates a login and returns a token on success otherwise return null
 * @param {string} username 
 * @param {string} password 
 * @param {Database} database 
 * @returns {string | null} - returns the token of the user or null if invalid
 */
export const authLogin = (username, password, database) => {
  return null;
}

/**
 * Logouts out a user and returns whether its successful
 * @param {string} token 
 * @param {Database} database
 * @returns {boolean}
 */
export const authLogout = (token, database) => {

}

/**
 * Authenticates a register and returns a token on success otherwise return null
 * @param {string} username 
 * @param {string} password 
 * @param {Database} database
 * @returns {string | null} - returns the token of the user or null if invalid
 */
export const authRegister = (username, password, database) => {

}