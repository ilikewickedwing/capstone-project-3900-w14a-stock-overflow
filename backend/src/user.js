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

/**
 * Function for getting default brokerage fee
 * @param {string} token 
 * @param {Database} database 
 * @returns  {Promise<float>}
 */
export const getDefBroker = async (token, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 2;
  }

  const resp = await database.getDefBroker(uid);
  return resp.defBroker;
}

/**
 * Function for setting default brokerage fee
 *  brokerFlag:
 *    0 - flat fee
 *    1 - percentage
 * @param {string} token 
 * @param {float} defBroker 
 * @param {int} brokerFlag 
 * @param {Database} database 
 * @returns {Promise<int>}
 */
export const setDefBroker = async (token, defBroker, brokerFlag, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 2;
  }

  // Return error if defBroker is not valid
  if (isNaN(defBroker) || defBroker < 0) {
    return 3;
  }

  // Return error if flag is wrong
  const flag = parseInt(brokerFlag);
  if (!(flag === 0 || flag === 1)) {
    return 4;
  }

  const resp = await database.setDefBroker(uid, defBroker, brokerFlag);
  return resp;
}