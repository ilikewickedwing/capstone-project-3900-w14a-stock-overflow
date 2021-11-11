

export const getCelebrityDiscover = async (res, database) => {
  const celebrities = await database.getAllCelebrityUsers();
  res.status(200).send({
    celebrities: celebrities
  })
}