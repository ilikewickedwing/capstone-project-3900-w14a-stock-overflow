import { MongoClient } from "mongodb";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { nanoid } from 'nanoid';

const URI = "mongodb+srv://deployment:deployment@cluster0.86ffq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

'stocksarecool'

const DATABASENAME = "stockportfolio";

// These are all the collections to be made on the database
const COLLECTIONS = [
  /**
    This stores all the user documents in the following form:
    {
      uid: string,
      username: string,
    }
  */
  'users',
  /**
    This stores all the passwords in the following form:
    {
      ownerUid: string,
      password: string,
    }
  */
  'passwords',
  /**
    Stores all the tokens of a user in the following form:
    {
      ownerUid: string,
      token: string,
    }
  */
  'tokens',
]

/**
 * This is a wrapper class around the MongoDB database
 */
export class Database {
  /**
   * If set to true, it will run a mongodb server in memory
   * instead of connecting to the deployment server
   *
   * Set this as false on deployment otherwise leave as true
   * @param {boolean} testmode 
   */
  constructor(testmode = true) {
    // Makes a mongodb client instance
    this.client = null;
    this.testmode = testmode;
    // Stores the mongodb database instance
    this.database = null;
    // This stores the mongodb test server if it is in
    // test mode
    this.mongoTestServer = null;
  }
  /**
   * Returns whether the database has the given username
   * @param {string} username 
   * @returns {Promise<boolean>}
   */
  async hasUsername(username) {
    const users = this.database.collection('users');
    const query = { username: username };
    const options = {
      // Only include the 'uid' field in the returned document
      projection: { uid: 1 }
    }
    const user = await users.findOne(query, options);
    return user !== null;
  }
  /**
   * Given a username, return the uid, otherwise return null
   * @param {string} username 
   * @returns {Promise<string | null>}
   */
  async getUid(username) {
    const users = this.database.collection('users');
    const query = { username: username };
    const options = {
      // Only include the 'uid' field in the returned document
      projection: { uid: 1 }
    }
    const user = await users.findOne(query, options);
    if (user !== null) {
      return user.uid;
    }
    return null;
  }
  /**
   * Given a uid, return the user data
   * @param {string} uid 
   * @returns {Promise<User | string>}
   */
  async getUser(uid) {
    const users = this.database.collection('users');
    const query = { uid: uid };
    const user = await users.findOne(query);
    if (user !== null) {
      return user;
    }
    return null;
  }
  /**
   * Inserts a new user into the database and returns the uid.
   * This function does not check if the username already exists, so you must check
   * before hand to ensure that there arent any duplicate usernames
   * @param {string} username 
   * @returns {Promise<string>}
   */
  async insertUser(username) {
    // Generate a new unique id
    const uid = nanoid();
    const users = this.database.collection('users');
    await users.insertOne({
      uid: uid,
      username: username
    })
    return uid;
  }
  /**
   * Updates a user object in the database and returns whether it was
   * successful. The userdata contains all the
   * properties to be changed in the object. Properties that are missing will
   * not be changed
   * @param {string} uid 
   * @param {User} userData
   * @returns {Promise<boolean}
   */
  async updateUser(uid, userData) {
    const users = this.database.collection('users');
    const query = { uid: uid };
    const result = await users.updateOne(query, { $set: userData});
    return result.modifiedCount !== 0;
  }
  /**
   * Given a uid, delete it from the database. Returns whether it was
   * successful or not. Note: This only deletes the user but not its password, nor
   * does it invalidate its tokens
   * @param {string} uid
   * @returns {Promise<boolean>}
   */
  async deleteUser(uid) {
    const users = this.database.collection('users');
    const query = { uid: uid }
    const result = await users.deleteOne(query);
    return result.deletedCount !== 0 ;
  }
  /**
   * Returns the password for a given uid, else return null
   * @param {string} uid 
   * @returns {Promise<string | null>}
   */
  async getPassword(uid) {
    const passwords = this.database.collection('passwords');
    const query = { ownerUid: uid };
    const options = {
      // Only include the 'uid' field in the returned document
      projection: { password: 1 }
    }
    const password = await passwords.findOne(query, options);
    if (password !== null) {
      return password.password;
    }
    return null;
  }
  /**
   * Enter a new password into the database
   * @param {string} uid 
   * @param {string} password 
   */
  async insertPassword(uid, password) {
    const passwords = this.database.collection('passwords');
    await passwords.insertOne({
      ownerUid: uid,
      password: password
    })
  }
  /**
   * deletes a password from the database and returns whether it was successful.
   * Note: Make sure the user is also deleted otherwise you will be left with a user
   * with no password
   * @param {string} ownerUid
   * @returns {Promise<boolean>}
   */
  async deletePassword(ownerUid) {
    const passwords = this.database.collection('passwords');
    const query = { ownerUid: ownerUid }
    const result = await passwords.deleteOne(query);
    return result.deletedCount !== 0 ;
  }
  /**
   * Creates a new token and adds it to the database and returns it
   * @param {string} uid 
   * @returns {Promise<string>}
   */
  async insertToken(uid) {
    const token = nanoid();
    const tokens = this.database.collection('tokens');
    await tokens.insertOne({
      ownerUid: uid,
      token: token
    })
    return token;
  }
  /**
   * deletes a given token from the database and returns whether
   * the token was deleted or not
   * @param {string} token 
   * @returns {Promise<boolean>}
   */
  async deleteToken(token) {
    const tokens = this.database.collection('tokens');
    const query = { token: token }
    const result = await tokens.deleteOne(query);
    return result.deletedCount !== 0 ;
  }
  /**
   * Given a uid, delete all the tokens that belong to the user and
   * return the number of tokens deleted
   * @param {string} uid
   * @returns {Promise<number>}
   */
  async deleteAllTokensOfUser(ownerUid) {
    const tokens = this.database.collection('tokens');
    const query = { ownerUid: ownerUid }
    const result = await tokens.deleteMany(query);
    return result.deletedCount;
  }
  /**
   * Returns the uid of the token owner
   * else returns null if token is invalid
   * @param {string} token 
   * @returns {Promise<string | null>}
   */
  async getTokenUid(token) {
    const tokens = this.database.collection('tokens');
    const query = { token: token };
    const options = {
      // Only include the 'uid' field in the returned document
      projection: { ownerUid: 1 }
    }
    const tokenResp = await tokens.findOne(query, options);
    if (tokenResp !== null) {
      return tokenResp.ownerUid;
    }
    return null;
  }
  /**
   * Connect to the database
   */
  async connect() {
    let uri = URI;
    if (this.testmode) {
      // Start test server in memory
      this.mongoTestServer = await MongoMemoryServer.create();
      // Get uri string
      uri = this.mongoTestServer.getUri();
    }
    // Start client
    this.client = new MongoClient(uri);
    // Connect to server
    try {
      console.log('Connecting to MongoDB database...');
      await this.client.connect();
      console.log('Successfully connected to MongoDB database');
    } catch (err) {
      console.error('Unable to connect to MongoDb database');
    }
    // Initialise database
    this.database = this.client.db(DATABASENAME);
    for (const collection of COLLECTIONS) {
      const cursor = this.database.listCollections({ name: collection });
      const hasNext = await cursor.hasNext();
      cursor.close();
      if (!hasNext) {
        this.database.createCollection(collection);
      }
    }
  }
  /**
   * Disconnects from the database
   */
  async disconnect() {
    this.client.close();
    if (this.testmode) {
      this.mongoTestServer.stop();
    }
  }
}