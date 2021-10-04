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
    console.log(user);
    if (user !== null) {
      return user.uid;
    }
    return null;
  }
  /**
   * Inserts a new user into the database and returns the uid
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
    console.log(password);
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
   * Connect to the database
   */
  async connect() {
    let uri = URI;
    if (this.testmode) {
      // Start test server in memory
      const devMongoDb = await MongoMemoryServer.create();
      // Get uri string
      uri = devMongoDb.getUri();
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
        console.log(`Created collection ${collection}`);
      }
    }
  }
}