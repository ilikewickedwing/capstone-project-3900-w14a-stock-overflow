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
export const getUserProfile = async (uid, token, database) => {
  const ownerUid = await database.getTokenUid(token);
  if (ownerUid !== uid) {
    return null;
  }
  const userData = await database.getUser(uid);
  return userData;
}

/**
 * Changes a user profile. Returns false when token is not valid
 * @param {string} uid 
 * @param {string} token 
 * @param {User} userData 
 * @param {Database} database
 * @returns {Promise<boolean | null>}
 */
export const postUserProfile = async (uid, token, userData, database) => {
  // Check token is valid
  const adminUid = await database.getTokenUid(token);
  if (adminUid !== uid) {
    return false;
  }
  // Make change to userData
  const resp = await database.updateUser(uid, userData);
  return resp;
}