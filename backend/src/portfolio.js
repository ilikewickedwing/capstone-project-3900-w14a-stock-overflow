/**
  This file manages all portfolio specific functions
*/

import { Database } from './database'

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