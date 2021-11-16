/**
  This file manages all admin specific functions
*/

import { authRegister } from "./auth";

/**
 * Create default admin user
 */
export const DEFAULTADMIN = {
  username: 'admin',
  password: 'admin'
}

/**
 * Function for posting celebrity requests
 * @param {string} token 
 * @param {string} info 
 * @param {string} fids 
 * @param {Database} database 
 * @param {Function} res 
 * @returns res
 */
export const postCelebrityMakeRequest = async (token, info, fids, database, res) => {
  // Validate token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    res.status(401).send({ error: "Invalid token" });
    return;
  }
  // Check that the user is not a celebrity or an admin
  const user = await database.getUser(uid);
  if (user.userType !== 'user') {
    res.status(403).send({ error: "A celebrity or an admin cannot request to be a celebrity again" })
    return;
  }
  // Make sure that a request doesnt already exist
  const request = await database.getCelebrityRequest(uid);
  if (request !== null) {
    res.status(403).send({ error: "You have already made a request" });
    return;
  }
  // Check that all the file ids are valid
  for (const fid of fids) {
    const f = await database.getFile(fid);
    if (f === null) {
      res.status(400).send({ error: `File with id ${fid} does not exist` });
      return;
    }
  }
  // Make a request
  const rid = await database.insertCelebrityRequest(uid, info, fids);
  res.status(200).send({
    rid: rid
  });
}

/**
 * Function for an admin to get celebrity requests
 * @param {string} token 
 * @param {Database} database 
 * @param {Function} res 
 * @returns res
 */
export const getAdminCelebrityRequests = async (token, database, res) => {
  // Validate token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    res.status(401).send({ error: "Invalid token" });
    return;
  }
  // Check that the user is an admin
  const user = await database.getUser(uid);
  if (user.userType !== 'admin') {
    res.status(403).send({ error: "You must be an admin to get requests" })
    return;
  }
  const requests = await database.getAllCelebrityRequests();
  const users = {};
  const files = {};
  for (const r of requests) {
    // Insert user data
    const userdata = await database.getUser(r.ownerUid);
    users[r.ownerUid] = userdata;
    // Insert file data
    for (const fid of r.fids) {
      const fileData = await database.getFile(fid);
      files[fileData.fid] = fileData.filename;
    }
  }
  // Return data
  res.status(200).send({
    requests: requests,
    users: users,
    files: files
  })
}

/**
 * Function to handle celebrity requests
 * @param {string} token 
 * @param {boolean} approve 
 * @param {string} rid 
 * @param {Database} database 
 * @param {Function} res 
 * @returns res
 */
export const postAdminCelebrityHandlerequest = async (token, approve, rid, database, res) => {
  // Validate token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    res.status(401).send({ error: "Invalid token" });
    return;
  }
  // Check that the user is an admin
  const user = await database.getUser(uid);
  if (user.userType !== 'admin') {
    res.status(403).send({ error: "You must be an admin to handle requests" })
    return;
  }
  // Get the request
  const requestData = await database.getCelebrityRequestById(rid);
  if (requestData === null) {
    res.status(400).send({ error: "Invalid rid" })
    return;
  }
  // Handle the request
  if (approve) {
    await database.updateUser(requestData.ownerUid, { userType: 'celebrity' });
    // Add notification
    await database.insertUserNotification(requestData.ownerUid, '🎉Congratulations🎉, your request to become a celebrity has been approved');
  } else {
    await database.insertUserNotification(requestData.ownerUid, 'Your request to become a celebrity has been rejected.');
  }
  // Remove request from database
  await database.deleteCelebrityRequest(rid);
  res.status(200).send();
}

/**
 * Function for the admin to delete users
 * @param {string} token 
 * @param {string} uid 
 * @param {Database} database 
 * @param {Function} res 
 * @returns res
 */
export const adminUserDelete = async (token, uid, database, res) => {
  const adminUid = await database.getTokenUid(token);
  if (adminUid === null) {
    res.status(401).send({ error: 'invalid token' });
    return;
  }
  const adminData = await database.getUser(adminUid);
  if (adminData.userType !== 'admin') {
    res.status(403).send({ error: 'You must be an admin to delete a user account' });
    return;
  }
  // Check user exists
  const userData = await database.getUser(uid);
  if (userData === null) {
    res.status(400).send({ error: `User with uid ${uid} does not exist` });
    return;
  }
  // If user is an admin make sure that its not the last admin
  if (adminUid === uid) {
    res.status(400).send({ error: `You cannot delete yourself. Another admin must do it` });
    return;
  }
  // Delete user
  const portfolios = await database.getPfs(uid);
  for (let i = 0; i < portfolios.length; i++) {
    await database.deletePf(uid, portfolios[i].pid);
  }
  await database.deleteUser(uid);
  await database.deletePassword(uid);
  await database.deleteAllTokensOfUser(uid);
  res.status(200).send();
}

/**
 * Function to ensure that there is at least one admin in the system
 * @param {Database} database 
 */
export const insertDefaultAdmin =  async (database) => {
  const uid = await database.getUid(DEFAULTADMIN.username);
  if (uid === null) {
    const resp = await authRegister(DEFAULTADMIN.username, DEFAULTADMIN.password, database);
    await database.updateUser(resp.uid, { userType: 'admin' });
  }
}