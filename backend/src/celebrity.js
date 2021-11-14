

export const getCelebrityDiscover = async (res, database) => {
  const celebrities = await database.getAllCelebrityUsers();
  const followersMap = {};
  for (const celeb of celebrities) {
    const followers = await database.getCelebrityFollowers(celeb.uid);
    followersMap[celeb.uid] = (followers === null) ? [] : followers.followers;
  }
  res.status(200).send({
    celebrities: celebrities,
    followers: followersMap,
  })
}

export const postCelebrityFollow = async (token, isFollow, celebUid, res, database) => {
  // Validate token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    res.status(401).send({ error: "Invalid token" });
    return;
  }
  // Make sure you arent following/unfollowing your self
  if (celebUid === uid) {
    res.status(400).send({ error: "You can't follow/unfollow your self" });
    return;
  }
  // Check celebrity exists
  const celeb = await database.getUser(celebUid);
  if (celeb === null) {
    res.status(400).send({ error: `Celebrity with uid ${celebUid} does not exist` });
    return;
  } else if (celeb.userType !== 'celebrity') {
    res.status(400).send({ error: "You can only follow celebrities" });
    return;
  }
  // Get followers of that celebrity
  let followers = await database.getCelebrityFollowers(celebUid);
  // Insert followers datastructure if it doesnt currently exist
  if (followers === null) {
    await database.insertCelebrityFollowers(celebUid);
    followers = { followers: [] };
  }
  // Get user request data
  const userData = await database.getUser(uid);
  // Check if following or not
  if (isFollow) {
    // Make sure you arent already following the celebrity
    if (followers.followers.includes(uid)) {
      res.status(400).send({ error: "You are already following this celebrity" });
      return;
    }
    // Add user to the following array
    followers.followers.push(uid);
    await database.updateCelebrityFollowers(celebUid, followers);
    res.status(200).send();
    // Add notification to database
    await database.insertUserNotification(celebUid, `${userData.username} started following you!🥳`)
    return;
  }
  // Otherwise it is to unfollow
  // Check that you are following the user
  if (!followers.followers.includes(uid)) {
    res.status(400).send({ error: "You arent currently following this celebrity" });
    return;
  }
  // Remove user from followers list
  followers.followers = followers.followers.filter(e => e !== uid);
  await database.updateCelebrityFollowers(celebUid, followers);
  res.status(200).send();
}

export const getUserCelebrities = async (token) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -1;
  }
  
  // Create the portfolio and return the result
  const celebResp = await database.getUserCelebrities(uid);
  return celebResp;
}