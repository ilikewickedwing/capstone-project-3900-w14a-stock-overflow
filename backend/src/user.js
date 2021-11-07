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
export const postUserProfile = async (uid, token, userData, database, res) => {
  // Check token is valid
  const adminUid = await database.getTokenUid(token);
  if (adminUid === null) {
    res.status(401).send({ message: 'Invalid token' });
    return;
  } else if (adminUid !== uid) {
    res.status(403).send({ message: 'You do not have correct privileges to edit' });
    return;
  }
  // If editing username ensure you cant change to a username that already exists
  if ('username' in userData) {
    const hasUsername = await database.hasUsername(userData.username);
    if (hasUsername) {
      res.status(400).send({ message: 'Username already exists' });
      return;
    }
  }
  // Make change to userData
  const resp = await database.updateUser(uid, userData);
  if (resp) {
    res.status(200).send();
    return;
  }
  res.status(403).send({ message: 'Invalid uid given '});
}

export const setDefBroker = async (token, defBroker, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 2;
  }

  const resp = await database.setDefBroker(uid, defBroker);
  return resp;
}