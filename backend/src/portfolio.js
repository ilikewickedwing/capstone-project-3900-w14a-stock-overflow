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
    return { pidResp: pid };
  }
  return null;
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

/**
 * Gets the portfolios for the user
 * @param {string} uid
 * @param {Database} database
 * @returns {Promise<Pf>}
 */
export const userPfs = async (uid, database) => {
	const userPf = await database.getPfs(uid);
  return userPf;
}

export const openPf = async (pid, database) => {
  const Pf = await database.openPf(pid);
  return Pf;
}
