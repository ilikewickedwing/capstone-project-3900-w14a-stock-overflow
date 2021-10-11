/**
  This file manages all portfolio specific functions
*/

import { Database } from "./database";

/**
 * 
 * @param {string} token 
 * @param {string} name 
 * @param {Database} database 
 * @returns 
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

export const openPf = async (pid, database) => {
  const Pf = await database.openPf(pid);
  return Pf;
}

export const deletePf = async (pid, database) => {
  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return false;
  }
  // Delete portfolio
  await database.deletePf(pid);
  return true;
}