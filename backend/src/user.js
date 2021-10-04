/**
  This file manages all user specific functions
*/

import { Database } from "./database";

/**
 * 
 * @param {string} uid 
 * @param {Database} database
 * @returns {Promise<User | null>}
 */
export const userProfile = async (uid, database) => {
  const userData = await database.getUser(uid);
  return userData;
}