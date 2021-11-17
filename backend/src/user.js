/**
  This file manages all user specific functions
*/

import { encryptPassword } from "./auth";
import { Database } from "./database";

export const getUserUid = async (username, database, res) => {
  const uid = await database.getUid(username);
  if (uid === null) {
    res.status(404).send();
    return
  }
  res.status(200).send({ uid: uid });
}

export const userPasswordchange = async (token, uid, newpassword, database, res) => {
  if (newpassword.length === 0) {
    res.status(400).send({ message: 'Your new password cant be empty' });
    return;
  }
  // Check token is valid
  const adminUid = await database.getTokenUid(token);
  if (adminUid === null) {
    res.status(401).send({ message: 'Invalid token' });
    return;
  }
  // Get the uid to change
  const userData = await database.getUser(uid);
  if (userData === null) {
    res.status(400).send({ message: `User with uid ${uid} doesnt exist` });
    return;
  }
  const adminData = await database.getUser(adminUid);
  // Only an admin or the user itself can change their password
  if (adminData.uid !== uid && adminData.userType !== 'admin') {
    res.status(403).send({ message: 'You do not have the correct privileges' });
    return;
  }
  const resp = await database.updatePassword(uid, encryptPassword(newpassword));
  res.status(200).send();
}

/**
 * 
 * @param {string} uid 
 * @param {Database} database
 * @returns {Promise<User | null>}
 */
export const getUserProfile = async (uid, token, database) => {
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
  const adminData = await database.getUser(adminUid);
  if (adminUid === null) {
    res.status(401).send({ message: 'Invalid token' });
    return;
  } else if (adminUid !== uid && adminData.userType !== 'admin') {
    res.status(403).send({ message: 'You do not have correct privileges to edit' });
    return;
  }
  // Get the old userData
  const oldUserData = await database.getUser(uid);
  if (oldUserData === null) {
    res.status(403).send({ message: 'Invalid uid given '});
    return;
  }
  // If editing username ensure you cant change to a username that already exists
  // if the username isnt yours
  if ('username' in userData) {
    const hasUsername = await database.hasUsername(userData.username);
    if (hasUsername && oldUserData.username !== userData.username) {
      res.status(400).send({ message: 'Username already exists' });
      return;
    } else if (userData.username.length === 0) {
      res.status(400).send({ message: 'Username cannot be blank' });
      return;
    }
  }
  // If usertype changed, make sure it is a valid type
  // and that they are an admin
  if ('userType' in userData) {
    if (adminData.userType !== 'admin') {
      res.status(403).send({ message: 'Only an admin can change the usertype' })
      return;
    }
    if (adminData.uid === uid) {
      res.status(403).send({ message: 'You cant change yourself to a different usertype' })
      return;
    }
    if (!['user','celebrity', 'admin'].includes(userData.userType)) {
      res.status(400).send({ message: 'Invalid user type' });
      return;
    }
    await database.insertUserNotification(uid, `An administrator has changed your account type to ${userData.userType}`)
  }
  // Make sure you cant change the _id parameter
  if ('_id' in userData) {
    delete userData['_id'];
  }
  // Make change to userData
  const resp = await database.updateUser(uid, userData);
  res.status(200).send();
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
  return resp;
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