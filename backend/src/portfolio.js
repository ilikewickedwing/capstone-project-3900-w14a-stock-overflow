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
export const createPortfolio = async (token, name, database) => {

    const uid = await database.getTokenUid(token);
    if (uid === null) {
      return false;
    }

    const portfolioId = await database.insertPortfolio(uid, name);
    if (portfolioId !== null) {
      return {portfolioId: portfolioId};
    }
    return null;
  }

/**
 * Gets the portfolios for the user
 * @param {string} uid
 * @param {Database} database
 * @returns {Promise<Portfolio>}
 */
export const userPortfolios = async (uid, database) => {
	const userPortfolio = await database.getPortfolios(uid);
  return userPortfolio;
}

export const openPortfolio = async (pid, database) => {
  const portfolio = await database.openPortfolio(pid);
  return portfolio;
}
