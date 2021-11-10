import { authRegister } from "./auth";

export const DEFAULTADMIN = {
  username: 'admin',
  password: 'admin'
}

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
  // make sure the a request doesnt already exist
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
  for (const r of requests) {
    const userdata = await database.getUser(r.ownerUid);
    users[r.ownerUid] = userdata;
  }
  // Return data
  res.status(200).send({
    requests: requests,
    users: users,
  })
}

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
    database.updateUser(requestData.ownerUid, { userType: 'celebrity' });
    // Add notification
    await database.insertUserNotification(requestData.ownerUid, '🎉Congratulations🎉, your request to become a celebrity has been approved');
  } else {
    await database.insertUserNotification(requestData.ownerUid, 'Your request to become a celebrity has been rejected.');
  }
  // Remove request from database
  await database.deleteCelebrityRequest(rid);
  res.status(200).send();
}

// Makes sure that there is at least one admin
export const insertDefaultAdmin =  async (database) => {
  const uid = await database.getUid(DEFAULTADMIN.username);
  if (uid === null) {
    const resp = await authRegister(DEFAULTADMIN.username, DEFAULTADMIN.password, database);
    await database.updateUser(resp.uid, { userType: 'admin' });
  }
}