
export const handleFileUpload = async (req, res, database) => {
  if(!req.files || !('upload' in req.files)) {
    res.send({
      status: false,
      message: 'You must include a file in your upload'
    })
  } else {
    const token = req.headers.token;
    if (token === undefined) {
      res.status(400).send({ error: "No Token given" });
      return;
    }
    // Validate token
    const uid = await database.getTokenUid(token);
    if (uid === null) {
      res.status(401).send({ error: "Invalid token" });
      return;
    }
    // Get the file data
    const fData = req.files.upload;
    
    // Convert to base64 string
    const contents = fData.data.toString('base64');
    
    // Add to database
    const fid = await database.insertFile(uid, fData.name, fData.mimetype, fData.size, contents);
    
    res.send({
      fid: fid
    });
  }
}

export const handleFileDownload = async(token, fid, res, database) => {
  // Validate token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    res.status(401).send({ error: "Invalid token" });
    return;
  }
  const uData = await database.getUser(uid);
  const fData = await database.getFile(fid);
  // Check that the token belongs to the file owner or the token owner is an admin
  if (!(fData.ownerUid === uid || uData.userType === 'admin')) {
    res.status(403).send({ error: "You do not have valid permissions to view this file" });
    return;
  }
  res.status(200).send(fData);
}