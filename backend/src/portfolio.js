/**
  This file manages all portfolio specific functions
*/

import { Database } from "./database";
import { getStock } from "./stocks";

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
 * @returns {Promise<Pfs | null>}
 */
export const createPf = async (token, name, database) => {
  // Return error if no name given
  if (name == "") {
    return 1;
  }

  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return false;
  }

  // Create the portfolio and return the result
  const pidResp = await database.insertPf(uid, name);
  if (pidResp !== null) {
    const obj = { pid: pidResp };
    return obj;
  }
  return null;
}

/**
 * Gets the portfolios for the user
 * Returns portfolio as array with object in form:
 * {
 *   pid: string,
 *   name: string,
 * }
 * @param {string} token
 * @param {Database} database
 * @returns {Promise<array>}
 */
export const userPfs = async (token, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) return 1;
  
  // Return result of database function
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
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 1;
  }

  // Return result of database function
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
  // Return result of database function
  const Pf = await database.openPf(pid);
  return Pf;
}

/**
 * Allows the user to edit the portfolio name
 * Returns null if portfolio does not exist
 * @param {string} token 
 * @param {string} pid 
 * @param {string} name 
 * @param {Database} database 
 * @returns 
 */
export const editPf = async (token, pid, name, database) => {
  // Return error if name is not valid
  if (name == '') {
    return 2;
  }

  // Return error if user is not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 3;
  }

  // Return error if pid is not valid
  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return 4;
  }

  // Return error if portfolio not owned by user
  const verify = await verifyPf(uid, pid, database);
  if (!verify) return 6;

  // Return result of database function
  const update = await database.editPf(uid, pid, name);
  return update;
}

/**
 * Verifies that user owns the portfolio
 * @param {string} uid 
 * @param {string} pid 
 * @param {Database} database 
 * @returns {Promise<boolean>}
 */
export const verifyPf = async (uid, pid, database) => {
  const userPfs = await database.getPfs(uid, database);
  let check = 0;

  for (let i = 0; i < userPfs.length; i++) {
    if (userPfs[i].pid === pid) {
      check = 1;
      break;
    }
  }

  return (check === 1);
}

/**
 * Deletes portfolio from database
 * @param {string} pid 
 * @param {Database} database 
 * @returns {Promise<boolean>}
 */
export const deletePf = async (token, pid, database) => {
  // Return error if user is not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 2;
  }

  // Return error if pid is not valid
  // Return error if pid belongs to watchlist
  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return 3;
  } else if (Pf.name == "Watchlist") {
    return 4;
  }

  // Return error if portfolio not owned by user
  const verify = await verifyPf(uid, pid, database);
  if (!verify) return -1;

  // Return result of database function
  const del = await database.deletePf(uid, pid);
  return del;
}

/**
 * Function to calculate the performance of a portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {Database} database 
 * @returns 
 */
export const calcPf = async (token, pid, database) => {
  // Return error if user is not found
  const uid = await database.getTokenUid(token);
  if (uid == null) {
    return -2;
  }

  // Return error if pid is not valid
  // Return error if pid belongs to watchlist
  const Pf = await database.openPf(pid);
  if (Pf == null) {
    return -3;
  } else if (Pf.name == "Watchlist") {
    return -4;
  }

  // Return error if portfolio not owned by user
  const verify = await verifyPf(uid, pid, database);
  if (!verify) return -1;

  const perf = await database.calcPf(pid);

  return perf;
}