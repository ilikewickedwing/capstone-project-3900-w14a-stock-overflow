
export const postCelebrityMakeRequest = async (token, info, database, res) => {
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
  // Make a request
  await database.insertCelebrityRequest(uid, info);
  res.status(200).send();
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
  // Return data
  res.status(200).send({
    requests: requests
  })
}

export const postAdminCelebrityHandlerequest = async () => {

}