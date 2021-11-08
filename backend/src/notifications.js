

export const getUserNotifications = async (token, database, res) => {
  // Validate token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    res.status(401).send({ error: "Invalid token" });
    return;
  }
  // Get notifications and send
  const notifs = await database.getAllUserNotifications(uid);
  res.status(200).send({
    notifications: notifs
  })
  // Delete notifications from database
  await database.clearAllUserNotifications(uid);
}