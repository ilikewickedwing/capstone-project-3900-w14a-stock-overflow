import { MongoClient } from "mongodb";
import { MongoMemoryServer } from 'mongodb-memory-server';

const URI = "mongodb+srv://<user>:<password>@cluster0.86ffq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

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
    // Stores the mongodb development server if in test mode
    this.devMongoDb = null;
  }
  /**
   * Connect to the database
   */
  async connect() {
    let uri = URI;
    if (this.testmode) {
      // Start test server in memory
      this.devMongoDb = await MongoMemoryServer.create();
      // Get uri string
      uri = this.devMongoDb.getUri();
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
  }
}