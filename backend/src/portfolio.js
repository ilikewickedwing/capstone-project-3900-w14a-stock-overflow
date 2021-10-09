/**
 * This is the file that manages portfolios
*/

import { Database } from "./database";

/**
 * 
 * @param {string} token 
 * @param {string} name 
 * @param {Database} database 
 * @returns 
 */
export const portfolioCreate = async (token, name, database) => {
    if (name == "") {
        return false;
    }

    const uid = await database.getTokenUid(token);
    if (uid === null) {
      return false;
    }

    const success = await database.insertPortfolio(uid, name);
    return success;

    // Create a new token
    const token = await database.insertToken(uid);
    return {
      uid: uid,
      token: token
    }
  }