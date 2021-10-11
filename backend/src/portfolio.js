/**
  This file manages all portfolio specific functions
*/

import { Database } from "./database";

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
 * @returns {Promise<array | null>}
 */
export const createPf = async (token, name, database) => {
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return false;
  }

  const pidResp = await database.insertPf(uid, name);
  if (pidResp !== null) {
    return pidResp;
  }
  return null;
}

/**
 * Gets the portfolios for the user
 * Returns portfolio as object in form:
 * {
 *   pid: string,
 *   name: string,
 * }
 * @param {string} token
 * @param {Database} database
 * @returns {Promise<Pf>}
 */
export const userPfs = async (token, database) => {
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return false;
  }
  
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
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return false;
  }

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
  const Pf = await database.openPf(pid);
  return Pf;
}

/**
 * Deletes portfolio from database
 * @param {string} pid 
 * @param {Database} database 
 * @returns {Promise<boolean>}
 */
export const deletePf = async (token, pid, database) => {
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return false;
  }

  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return false;
  }
  // Delete portfolio
  await database.deletePf(uid, pid);
  return true;
}