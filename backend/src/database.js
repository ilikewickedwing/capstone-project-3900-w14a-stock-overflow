import { MongoClient } from "mongodb";

const uri = "mongodb+srv://<user>:<password>@cluster0.86ffq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

/**
 * This is a wrapper class around the MongoDB database
 */
export class Database {
  constructor() {
    // Makes a mongodb client instance
    this.client = new MongoClient(uri);
  }
  /**
   * Connect to the database
   */
  async connect() {
    try {
      console.log('Connecting to MongoDB database...');
      await this.client.connect();
      console.log('Successfully connected to MongoDB database');
    } catch (err) {
      console.error('Unable to connect to MongoDb database');
    }
  }
}