import { MongoClient } from "mongodb";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { nanoid } from 'nanoid';
import { insertDefaultAdmin } from "./admin";
import { calcAll } from './performance';
import { getFriends } from "./social";

const DATABASENAME = "stockoverflow";

// This is the uri authentication for the mongodb database in the cloud
// It is the pretty mcuh the password to accessing the deployment database
const URI = `mongodb+srv://stockoverflow:stockoverflow@cluster0.4fgf0.mongodb.net/${DATABASENAME}?retryWrites=true&w=majority`;

// These are all the collections to be made on the database
const COLLECTIONS = [
  /**
    This stores all the user documents in the following form:
    {
      uid: string,
      username: string,
      userType: string  // This can either be: user, admin, celebrity
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
  /**
    Stores all the portfolios of a user in the following form:
    {
      ownerUid: string,
      pfs: [
        {
          pid: string,
          name: string,
        }
      ],
      defBroker: float,
      brokerFlag: int,
      performance: [
        {
          date: string,
          performance: float,
          money: float
        }
      ],
      change: [
        {
          date: string,
          percentage: float,
          money: float
        }
      ],
      value: [
        spent: float,
        sold: float
      ]
    }
   */
  'userPortos',
  /**
    Stores all the portfolios and their stocks in the following form:
    {
      pid: string,
      name: string,
      stocks: [
        {
          stock: string,
          avgPrice: float,
          quantity: int,
          performance: [
            {
              date: string,
              performance: float,
            }
          ]
        }
      ],
      value: {
        spent: float,
        sold: float,
        performance: [
          {
            date: string,
            performance: float,
            money: float
          }
        ],
        change: {
          [
            date: string,
            percentage: float,
            money: float
          ]
        }
      }
    }
   */
  'portfolios',
  /**
    This stores all the friends in the following form:
    {
      ownerUid: string,
      friends: [string],
      requests: [string],
    }
  */
  'friends',
    /**
    Stores all the user's activities in the following form:
    {
      ownerUid: string,
      activities: [string],
    }
   */
  'userActivity',
  /**
    This stores all activities in the following form:
    {
      ownerName: string,
      ownerUid: string,
      parentId: string,
      aid: string,
      message: string,
      time: Date,
      likes: int,
      likedUsers: [string],
      userComments: [string],
    }
  */
  'activity',
  /**
    This stores all bearish/bullish in the following form:
    {
      stock: string,
      bear: [string],
      bull: [string],
    }
  */
  'stocks',
  /**
    Stores all the requests made by ordinary users to become celebrity
    {
      // Id of the request
      rid: string,
      ownerUid: string,
      // Info given by the user on why they want to be a celebrity and so on
      info: string,
    }
  */
  'celebrityRequests',
  /**
    Stores all the followers of a given celebrity
    {
      celebUid: string // uid of the celebrity
      followers: array // An array of uids of the followers
    }
  */
  'celebrityFollowers',
  /**
    Stores all the notifications for a given user
    {
      ownerUid: string,
      // Info of the notification
      info: string,
      // An array of the file ids of all the files uploaded
      fids: array
    }
  */
  'notifications',
  /**
    Stores all the files uploaded
    {
      fid: string // id of the file
      ownerUid: string // person who uploaded the file
      filename: string
      mimetype: string
      size: string
      data: string // the contents of the file in base64 encoding
    }
  */
  'files',
  /**
    Stores the global rankings
    {
      rank: int
      uid: string
      name: string
      performance: {
        performance: float,
        money: float
      }
    }
  */
  'rankings',
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
   * Get all users
   * @returns {Promise<Array>}
   */
   async getAllUsers() {
    const users = this.database.collection('users');
    const requests = await users.find().toArray();
    return requests;
  }

	
  /**
	 * Inserts a new user into the database and returns the uid.
	 * This function does not check if the username already exists, so you must check
	 * before hand to ensure that there arent any duplicate usernames
	 * @param {string} username 
	 * @returns {Promise<string>}
   */
	async insertUser(username, userType = 'user') {
    // Generate a new unique id
    const uid = nanoid();
    const users = this.database.collection('users');
    await users.insertOne({
      uid: uid,
      username: username,
      userType: userType
    })
		
    const now = new Date();
    const today = new Date(now);
    const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    const date = time.toString();
		
    // Create a new userPorto and add a watchlist for the new user
    const userPortos = this.database.collection('userPortos');
    const watchlistId = nanoid();
    await userPortos.insertOne({
			ownerUid: uid,
      pfs: [
				{
					pid: watchlistId,
          name: "Watchlist",
        }
      ],
      defBroker: null,
      brokerFlag: null,
      performance: [
				{
					date: date,
          performance: 0,
          money: 0
        }
      ],
      change: [
				{
					date: date,
          percentage: 0,
          money: 0
        }
      ]
    })
    const pfs = this.database.collection('portfolios');
    await pfs.insertOne({
			pid: watchlistId,
      name: "Watchlist",
      stocks: [],
      value: {
				spent: null,
        sold: null,
        performance: [
					{
						date: null,
            performance: null,
            money: null
          }
        ],
        change: [
					{
						date: null,
            percentage: null,
            money: null
          }
        ]
      }
    })
		
    // Create an empty friends list
    const friends = this.database.collection('friends');
    await friends.insertOne({
			ownerUid: uid,
      friends: [],
      requests: [],
    })
		
    // Create an empty userActivity
    const activities = this.database.collection('userActivity');
    await activities.insertOne({
			ownerUid: uid,
      activities: [],
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
    return result.deletedCount !== 0;
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
	 * Function to set the performance of the user
	 * @param {string} uid 
	 * @param {Object} performance 
	 * @returns float
	 */
	async setUserPerf(uid, performance) {
		const users = this.database.collection('userPortos');
		const query = { ownerUid: uid };
		const user = await users.findOne(query);
		const now = new Date();
		const today = new Date(now);
		const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
		const date = time.toString();
	
		// Calculate the percentage performance
		const perc = (performance.money + performance.sold)/performance.spent * 100;
		// Create performance and value objects
		const perf = {
			date: date,
			performance: perc,
			money: performance.money
		}
		const value = {
			spent: performance.spent,
			sold: performance.sold
		}
		
		// Update user
		const performanceArr = user.performance;
		performanceArr.push(perf);
		user.value = value;

		// Calculate changes and update
		let prevVal = null;
		let prevPerc = null;
		const prevPerf = user.performance[user.performance.length - 2];
		if (prevPerf) {
			prevVal = prevPerf.money;
			prevPerc = prevPerf.performance;
		} else {
			prevVal = 0;
			prevPerc = 0;
		}
		const change = performance.money - prevVal;
		const changePerc = perc - prevPerc;
		const newVal = user.change;
		newVal.push({ date: date, percentage: changePerc, money: change });

		// Update user in database
		await users.updateOne(query, { $set: { performance: performanceArr, value: value, change: newVal }});
		return perc;
	}

	/**
	 * Function to get the performance of the user
	 * @param {string} uid 
	 * @returns {Promise<Object>}
	 */
	async getUserPerf(uid) {
		const userPortos = this.database.collection('userPortos');
		const query = { ownerUid: uid };
		const userPortoResp = await userPortos.findOne(query);
		// console.dir(userPortoResp, {depth:null});

		const users = this.database.collection('users');
		const query2 = { uid: uid };
		const userResp = await users.findOne(query2);
		// console.dir(userResp, {depth:null});
		const perf = {
			name: userResp.username,
			performance: userPortoResp.performance,
			change: userPortoResp.change,
		};

		return perf;
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
	 * Updates password into the database
	 * @param {string} uid 
	 * @param {string} password 
   */
	async updatePassword(uid, password) {
		const passwords = this.database.collection('passwords');
    const query = { ownerUid: uid };
    const result = await passwords.updateOne(query, { $set: {
			password: password
    }})
    return result.modifiedCount !== 0;
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
    return result.deletedCount !== 0;
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
	 * Function to get an array of all the celebrities
	 * @returns {Promise<Array>}
	 */
  async getAllCelebrityUsers() {
    const users = this.database.collection('users');
    const query = { userType: 'celebrity' };
    const celebs = await users.find(query).toArray();
    return celebs;
  }
  
	/**
	 * Function to get an array of all a celebrities followers
	 * @param {string} celebUid 
	 * @returns {Promise<Array>}
	 */
  async getCelebrityFollowers(celebUid) {
    const celebFollowers = this.database.collection('celebrityfollowers');
    const query = { celebUid: celebUid };
    const followers = await celebFollowers.findOne(query);
    return followers;
  }

	/**
	 * Function to get an array of all celebrities a user follows
	 * @param {string} uid 
	 * @returns {Promise<Array>}
	 */
  async getUserCelebrities(uid) {
    const celebFollowers = this.database.collection('celebrityfollowers');
    const query = { followers: uid };
    const followers = await celebFollowers.find(query);
    const celebs = (await followers.toArray()).map((e)=> {return e.celebUid})

    const usersResp = this.database.collection('users');
    const userCelebs = usersResp.find({uid : { $in : celebs}})
    return userCelebs.toArray();
  }

  /**
   * Inserts a celebrity followers datastructure
   *
   * IMPORTANT:
   * This method does not check that a datastructure with the same
   * celebUid already exists so please check that before hand with
   * getCelebrityFollowers
   *
   * @param {string} celebUid 
   * @param {array} followers 
   */
  async insertCelebrityFollowers(celebUid, followers=[]) {
    const celebFollowers = this.database.collection('celebrityfollowers');
    await celebFollowers.insertOne({
      celebUid: celebUid,
      followers: followers
    })
  }
  
  /**
   * Update celebrity followers
   * 
   * NOTE: followers is the datastructure rather than the array
   * so you must wrap the array in an object
   */
  async updateCelebrityFollowers(celebUid, followers) {
    const celebFollowers = this.database.collection('celebrityfollowers');
    const query = { celebUid: celebUid };
    const result = await celebFollowers.updateOne(query, {
      $set: followers
    })
    return result.modifiedCount !== 0;
  }
  
  /**
   * Inserts request into database. Does not check if ownerUid already exists
   * so make sure to check it with the getRequest
   * @param {string} ownerUid 
   * @param {string} info 
   */
  async insertCelebrityRequest(ownerUid, info, fids) {
    // Generate a new unique rid
    const rid = nanoid();
    const celebrityRequests = this.database.collection('celebrityRequests');
    await celebrityRequests.insertOne({
      rid: rid,
      ownerUid: ownerUid,
      info: info,
      fids: fids
    });
    return rid;
  }
  
  /**
   * Given an ownerUid return the celebrity request
   * @param {string} ownerUid 
   * @returns 
   */
  async getCelebrityRequest(ownerUid) {
    const celebrityRequests = this.database.collection('celebrityRequests');
    const query = { ownerUid: ownerUid };
    const request = await celebrityRequests.findOne(query);
    return request;
  }
  
  /**
   * Get the celebrity request given the rid
   * @param {string} rid 
   * @returns 
   */
  async getCelebrityRequestById(rid) {
    const celebrityRequests = this.database.collection('celebrityRequests');
    const query = { rid: rid };
    const request = await celebrityRequests.findOne(query);
    return request;
  }
  
  /**
   * Get all requests to become a celebrity
   * @returns 
   */
  async getAllCelebrityRequests() {
    const celebrityRequests = this.database.collection('celebrityRequests');
    const requests = await celebrityRequests.find().toArray();
    return requests;
  }
  
  /**
   * Deletes a specific request to be a celebrity
   * @param {string} rid 
   * @returns 
   */
  async deleteCelebrityRequest(rid) {
    const celebrityRequests = this.database.collection('celebrityRequests');
    const query = { rid: rid };
    const request = await celebrityRequests.deleteOne(query);
    return request.deletedCount !== 0;
  }
  
  /**
   * Insert a new user notification
   * @param {string} ownerUid 
   * @param {string} info 
   */
  async insertUserNotification(ownerUid, info) {
    const notifications = this.database.collection('notifications');
    await notifications.insertOne({
      ownerUid: ownerUid,
      info: info
    })
  }
  
  /**
   * Get all the notifications for a specific user
   * @param {string} ownerUid 
   * @returns 
   */
  async getAllUserNotifications(ownerUid) {
    const notifications = this.database.collection('notifications');
    const query = { ownerUid: ownerUid };
    const requests = await notifications.find(query).toArray();
    return requests;
  }
  
  /**
   * Delete all the user notifications of a specific user
   * @param {string} ownerUid 
   * @returns 
   */
  async clearAllUserNotifications(ownerUid) {
    const notifications = this.database.collection('notifications');
    const query = { ownerUid: ownerUid };
    const result = await notifications.deleteMany(query);
    return result.deletedCount;
  }
  
  /**
   * Inserts a file into the database
   * @param {string} ownerUid 
   * @param {string} data // The contents of the file in base 64 encoding 
   * @returns 
   */
  async insertFile(ownerUid, filename, mimetype, size, data) {
    // Generate a new unique rid
    const fid = nanoid();
    const files = this.database.collection('files');
    await files.insertOne({
      fid: fid,
      filename: filename,
      ownerUid: ownerUid,
      mimetype: mimetype,
      size: size,
      data: data
    });
    return fid;
  }
  
  /**
   * Returns a given file with the given file id
   * @param {string} fid 
   * @returns 
   */
  async getFile(fid) {
    const files = this.database.collection('files');
    const query = { fid: fid };
    const request = await files.findOne(query);
    return request;
  }
  
  /**
   * Returns the default brokerage cost of the user
   * @param {string} uid 
   * @returns {Promise<float>}
   */
  async getDefBroker(uid) {
    const userPortos = this.database.collection('userPortos');
    const query = { ownerUid: uid };
    const userPortoResp = await userPortos.findOne(query);

    return { defBroker: userPortoResp.defBroker, brokerFlag: userPortoResp.brokerFlag };
  }

  /**
   * Sets the default brokerage cost of the user
   * @param {string} uid 
   * @param {float} broker 
   * @param {int} flag 
   * @returns{Promise<int>}
   */
  async setDefBroker(uid, broker, flag) {
    const userPortos = this.database.collection('userPortos');
    const query = { ownerUid: uid };
    const userPortoResp = await userPortos.findOne(query);

    const brokerFee = parseFloat(broker);
    userPortoResp.defBroker = brokerFee;
    userPortoResp.brokerFlag = flag;
    const result = await userPortos.updateOne( query, { $set: { defBroker: brokerFee, brokerFlag: flag } } );

    if (result.modifiedCount !== 0) return 1;
    else return 0;
  }

  /**
   * Function to return array of all portfolios in database
   * @returns {Promise<Array>}
   */
  async getAllPfs() {
    // console.log('getAllPfs');
    const pfs = this.database.collection('portfolios');
    if (pfs.countDocuments() == 0) return [];
    const requests = await pfs.find().toArray();
    return requests;
  }

  /**
   * Function to create new portfolio and returns the portfolio id
   * @param {string} uid 
   * @param {string} name 
   * @returns {Promise<string | null>}
   */
  async insertPf(uid, name) {
    // First query for the user's userPorto
    const userPortos = this.database.collection('userPortos');
    const query1 = { ownerUid: uid };
    const userPortoResp = await userPortos.findOne(query1);
    const userPfs = userPortoResp.pfs;
    const pfs = this.database.collection('portfolios');
    const now = new Date();
    const today = new Date(now);
    const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    const date = time.toString();

    // If user owns no portfolios with same name then create 
    // a new portfolio
    for (let i = 0; i < userPfs.length; i++) {
      if (userPfs[i].name == name) {
        return null;
      }
    }

    const Pid = nanoid();
    await pfs.insertOne({
      pid: Pid,
      name: name,
      stocks: [],
      value: {
        spent: 0,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0,
            money: 0
          }
        ],
        change: [
          {
            date: date,
            percentage: 0,
            money: 0
          }
        ]
      }
    });

    userPfs.push({ pid: Pid, name: name });
    await userPortos.updateOne( query1, { $set : { pfs: userPfs } } );
    return Pid;
  }

  /**
   * Returns the portfolios owned by the user
   * else returns null if the id is invalid
   * @param {string} uid
   * @returns {Promise<array | null>}
   */
  async getPfs(uid) {
    const userPortos = this.database.collection('userPortos');
    const query = { ownerUid: uid };
    const userPortoResp = await userPortos.findOne(query);
    const userPfs = userPortoResp.pfs;
    if (userPfs !== null) {
      return userPfs;
    }
    return 2;
  }

  /**
   * Returns the id of the portfolio given the name
   * else returns null if the user or name are invalid or portfolio doesn't exist
   * @param {string} uid 
   * @param {string} name 
   * @returns {Promise<string | null>}
   */
  async getPid(uid, name) {
    if (name == "") {
      return null;
    }

    // Find the list of portfolios belonging to the user
    const userPortos = this.database.collection('userPortos');
    const query1 = { ownerUid: uid };
    const userPortoResp = await userPortos.findOne(query1);
    const userPfs = userPortoResp.pfs;

    // Search for the portfolio and return the pid
    for (let i = 0; i < userPfs.length; i++) {
      if (userPfs[i].name == name) {
        return userPfs[i].pid;
      }
    }

    return null;
  }

  /**
   * Returns the portfolio requested
   * else returns null if the id is invalid
   * @param {string} pid 
   * @returns {Promise<array | null>}
   */
  async openPf(pid) {
    const pfs = this.database.collection('portfolios');
    const query = { pid: pid };
    const pfResp = await pfs.findOne(query);
    if (pfResp !== null) {
      return pfResp;
    }
    return null
  }

  /**
   * Function to change the name of the portfolio
   * @param {string} uid 
   * @param {string} pid 
   * @param {string} name 
   * @returns 
   */
  async editPf(uid, pid, name) {
    // Change the name in the database
    const pfs = this.database.collection('portfolios');
    const query1 = { pid: pid };
    
    // Change the name in user portfolio list
    const userPortos = this.database.collection('userPortos');
    const query2 = { ownerUid: uid };
    const userPortoResp = await userPortos.findOne(query2);
    const userPfs = userPortoResp.pfs;

    // If name already exists, return -1
    for (let i = 0; i < userPfs.length; i++) {
      if (userPfs[i].name == name) {
        return -1;
      }
    }

    for (let i = 0; i < userPfs.length; i++) {
      if (userPfs[i].pid == pid) {
        if (userPfs[i].name == 'Watchlist') {
          return 5;
        }
        userPfs.splice(i, 1);
        break;
      }
    }
    const result = await pfs.updateOne(query1, { $set: { name: name } });

    userPfs.push({ pid: pid, name: name });
    await userPortos.updateOne(query2, { $set: { pfs: userPfs } });
 
    if (result.modifiedCount !== 0) return 1;
    else return 0;
  }

  /**
   * Function to update the calculated portfolio in the database
   * @param {string} pid 
   * @param {Object} value 
   * @param {Object} stocks 
   * @returns {Promise<boolean>}}
   */
  async calcPf(pid, value, stocks) {
    const pfs = this.database.collection('portfolios');
    const query = { pid: pid };

    const result = await pfs.updateOne(query, { $set: { stocks: stocks, value: value } } );
    return (result.modifiedCount!== 0);
  }


  /**
   * Deletes a given portfolio from the database and
   * returns whether the portfolio was deleted or not
   * @param {string} uid
   * @param {string} pid 
   * @returns {Promise<boolean>}
   */
  async deletePf(uid, pid) {
    const pfs = this.database.collection('portfolios');
    const query1 = { pid: pid };
    const result = await pfs.deleteOne(query1);

    const userPortos = this.database.collection('userPortos');
    const query2 = { ownerUid: uid };
    const userPortoResp = await userPortos.findOne(query2);
    const userPfs = userPortoResp.pfs;

    var i = 0;
    while (i < userPfs.length) {
      if (userPfs[i].pid == pid) {
        userPfs.splice(i, 1);
        break;
      }
      i++;
    }
    await userPortos.updateOne( query2, { $set: { pfs: userPfs } } );

    if (result.deletedCount !== 0) return 1;
    else return 0;
  }

  /**
   * Adds a stock to the portfolio and returns result
   * @param {string} pid 
   * @param {string} stock 
   * @param {float} price 
   * @param {int} quantity 
   * @returns {Promise <boolean>}
   */
  async addStocks(pid, stock, price, quantity, brokerage, flag) {
    // Find the corresponding portfolio for the given pid
    const pfs = this.database.collection('portfolios');
    const query = {pid: pid};
    const pfResp = await pfs.findOne(query);
    const stockList = pfResp.stocks; // The stock list inside the portfolio
    const pfValue = pfResp.value; // The value object inside the portfolio

    // Trying to find the index of the stock if it already exists
    // in stock list
    let stkIndex = -1;
    for (let i = 0; i < stockList.length; i++) {
      if (stockList[i].stock == stock) {
        stkIndex = i;
        break;
      }
    }

    if (stkIndex != -1) { // If the stock is already in the list
      if(pfResp.name === 'Watchlist') return 6;
      let cost = stockList[stkIndex].avgPrice * stockList[stkIndex].quantity;
      cost += price * quantity;
      stockList[stkIndex].quantity += quantity;
      stockList[stkIndex].avgPrice = cost / stockList[stkIndex].quantity;
    } else { // Else if the stock is not in the list
      const now = new Date();
      const today = new Date(now);
      const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
      const date = time.toString();
      if (pfResp.name === 'Watchlist') {
        stockList.push({
          stock: stock,
          avgPrice: null,
          quantity: null,
          performance: [
            {
              date: null,
              performance: null
            }
          ]
        })
      } else {
        stockList.push({
          stock: stock,
          avgPrice: price,
          quantity: quantity,
          performance: [
            {
              date: date,
              performance: 0
            }
          ]
        })
      }
    }

    pfValue.spent += price * quantity;
    if (flag === '0') pfValue.spent += brokerage;
    else if (flag === '1') pfValue.spent += (brokerage * (quantity * price) / 100);

    // Updating database
    await pfs.updateOne(query, { $set: { stocks: stockList, value: pfValue } } );
    
    return -1;
  }

  /**
   * Function to sell stocks from portfolio
   * @param {string} pid 
   * @param {string} stock 
   * @param {int} quantity 
   * @returns {Promise <boolean>}
   */
  async sellStocks(pid, stock, price, quantity, brokerage, flag) {
    // Find the corresponding portfolio for the given pid
    const pfs = this.database.collection('portfolios');
    const query = {pid: pid};
    const pfResp = await pfs.findOne(query);
    const stockList = pfResp.stocks; // The stock list in the portfolio
    const pfValue = pfResp.value; // The value object inside the portfolio

    // Finding the index of the stock in the stock list
    let stkIndex = -1;
    for (let i = 0; i < stockList.length; i++) {
      if (stockList[i].stock == stock) {
        stkIndex = i;
        break;
      }
    }
    
    if (stkIndex != -1) { // If stock is in the portfolio
      if (pfResp.name !== 'Watchlist') {
          if (stockList[stkIndex].quantity - quantity < 0) {
          return 4;
        }
        else {
          stockList[stkIndex].quantity -= quantity;
          // if (stockList[stkIndex].quantity == 0) {
          //   stockList.splice(stkIndex, 1);
          // }
        }
      } else {
        stockList.splice(stkIndex, 1);
      }
    } else {  // If stock does not exist in portfolio
      return 5;
    }

    pfValue.sold += price * quantity;

    if (flag === '0') pfValue.spent += brokerage;
    else if (flag === '1') pfValue.spent += (brokerage * (quantity * price) / 100);

    // Updating database
    await pfs.updateOne(query, { $set: { stocks: stockList, value: pfValue } } );
    
    return -1;
  }

  /**
   * Function to check on stock contained within portfolio
   * @param {string} pid 
   * @param {string} stock 
   * @returns {Promise <object>}
   */
  async getStock(pid, stock) {
    // Find the corresponding portfolio for the given pid
    const pfs = this.database.collection('portfolios');
    const query = {pid: pid};
    const pfResp = await pfs.findOne(query);

    if (pfResp == null) {
      return null;
    }

    const stockList = pfResp.stocks; // The stock list inside the portfolio

    // Trying to find the stock in stockList
    for (let index = 0; index < stockList.length; index++) {
      const element = stockList[index];
      if (element.stock == stock) {
        return element;
      }
    }
    return null;
  }

	/**
	 * Function to add a friend
	 * @param {string} uid 
	 * @param {string} friend 
	 * @returns {Promise}
	 */
  async addFriend(uid, friend) {
    // Check whether given friend id is valid
    const friendResp = await this.getUser(friend);
    if (friendResp === null) {
      return -1;
    }

    if (await this.checkFriend(uid, friend)) {
      return -4;
    }

    // Find the friendlist for the given uid
    const friends = this.database.collection('friends');
    const friendsResp = await friends.findOne({ownerUid: friend});
    const userResp = await friends.findOne({ownerUid: uid});

    if (friendsResp == null) {
      return -3;
    }
    let friendRequests = friendsResp.requests;
    let userRequests = userResp.requests;

    const requestIndex = userRequests.indexOf(friend);
    if (requestIndex === -1) { // other user has not sent a friend request
      if (friendRequests.indexOf(uid) !== -1) {
        return -5;
      }

      friendRequests.push(uid);

      await friends.updateOne({ownerUid : friend}, {$set: {requests: friendRequests}});
      await this.insertUserNotification(friend, `${friendResp.username} has sent you a friend request 🥺🥺`);
    } else { // other user has already sent a friend request
      userRequests.splice(requestIndex, 1);

      let friendList = friendsResp.friends;
      let userList = userResp.friends;
      friendList.push(uid);
      userList.push(friend);

      await friends.updateOne({ownerUid: friend}, {$set: {friends: friendList}});
      await friends.updateOne({ownerUid: uid}, {$set: {friends: userList, requests: userRequests}});
      const usernameResp = await this.getUser(uid);
      await this.insertUserNotification(friend, `🌙 You are now friends with ${usernameResp.username} 🌙`);
    }

    return true;
  }

	/**
	 * Function to decline a friend request
	 * @param {string} uid 
	 * @param {string} friend 
	 * @returns {Promise}
	 */
  async declineFriend(uid, friend) {
    // Check whether given friend id is valid
    const friendResp = await this.getUser(friend);
    if (friendResp === null) {
      return -1;
    }

    if (await this.checkFriend(uid, friend)) {
      return -4;
    }

    // Find the friendlist for the given uid
    const friends = this.database.collection('friends');
    const userResp = await friends.findOne({ownerUid: uid});

    if (userResp == null) {
      return -3;
    }
    let userRequests = userResp.requests;

    const requestIndex = userRequests.indexOf(friend);
    if (requestIndex === -1) { // other user has not sent a friend request
      return -5;
    } else { // other user has already sent a friend request
      userRequests.splice(userRequests.indexOf(friend), 1);

      await friends.updateOne({ownerUid: uid}, {$set: {requests: userRequests}});
    }

    return true;
  }

	/**
	 * Function to remove a friend
	 * @param {string} uid 
	 * @param {string} friend 
	 * @returns {Promise}
	 */
  async removeFriend(uid, friend) {
    // Find the friendList for the given uid
    const friends = this.database.collection('friends');
    const friendsResp = await friends.findOne({ownerUid: friend});
    const userResp = await friends.findOne({ownerUid: uid});
    let friendList = friendsResp.friends;
    let userList = userResp.friends;

    if (friendsResp == null) {
      return -3;
    }

    // Remove from friend's friend list
    const index1 = friendList.indexOf(uid);
    if (index1 === -1) {
      return -1;
    }
    friendList.splice(index1,1);
    await friends.updateOne({ownerUid: friend}, { $set : { friends: friendList}});

    // Remove from user's friend list
    const index2 = userList.indexOf(friend);
    if (index2 === -1) {return -1}
    userList.splice(index2,1);
    await friends.updateOne({ownerUid: uid}, { $set : { friends: userList}});

    return true;
  }

	/**
	 * Function to return array of all a users friends
	 * @param {string} uid 
	 * @returns {Promise<Array>}
	 */
  async getFriends(uid) {
    // Find the friendlist for the given uid
    const friends = this.database.collection('friends');
    const query = {ownerUid: uid};
    const friendsResp = await friends.findOne(query);

    if (friendsResp == null) {
      return -2;
    }

    const usersResp = this.database.collection('users');
    const userFriends = usersResp.find({uid : { $in : friendsResp.friends}})
    if (userFriends === null) {
      return [];
    }
    return userFriends.toArray();
  }

	/**
	 * Function to return array of all a users friend requests
	 * @param {string} uid 
	 * @returns {Promise<Array>}
	 */
  async getFriendReq(uid) {
    // Find the friend request list for the given uid
    const friends = this.database.collection('friends');
    const query = {ownerUid: uid};
    const friendsResp = await friends.findOne(query);

    if (friendsResp == null) {
      return -2;
    }
    const usersResp = this.database.collection('users');
    const userFriends = usersResp.find({uid : { $in : friendsResp.requests}})
    return userFriends.toArray();
  }

	/**
	 * Function to check if two users are friends
	 * @param {string} uid 
	 * @param {string} friend 
	 * @returns {Promise<Boolean>}
	 */
  async checkFriend(uid, friend) {
    // Find the friendlist for the given uid
    const friends = this.database.collection('friends');
    const query = {ownerUid: uid};
    const friendsResp = await friends.findOne(query);

    if (friendsResp == null) {
      return false;
    }

    let friendList = friendsResp.friends;
    const index = friendList.indexOf(friend);
    if (index === -1) {
      return false;
    }
    return true;
  }

	/**
	 * Function to create an activity
	 * @param {string} uid 
	 * @param {string} message 
	 * @param {string} parentId 
	 * @returns {Promise<string>}
	 */
  async createActivity(uid, message, parentId) {
    const userResp = await this.getUser(uid);
    const userComment = userResp.username + ' ' + message;
    const aid = nanoid();
		const now = new Date();
		const today = new Date(now);
		const test = new Date();
		test.setHours(today.getHours() + 11);
    const obj = {
      ownerName: userResp.username,
      ownerUid: uid,
      parentId: parentId,
      aid: aid,
      message: userComment,
      time: test,
      likes: 0,
      likedUsers: [],
      userComments: [],
    }

    const userActivity = this.database.collection('userActivity');
    const activity = this.database.collection('activity');
    const query = { ownerUid: uid };
    const userActivityResp = await userActivity.findOne(query);
    let activities = userActivityResp.activities;
    activities.push(aid);

    await activity.insertOne(obj);
    await userActivity.updateOne( query, { $set : { activities: activities } } );

    // Sending notification to every friend
    const friends = await this.getFriends(uid);
    for (let i= 0; i < friends.length; i++) {
      const e = friends[i].uid;
      await this.insertUserNotification(e, userComment);
    }

    return aid;
  }

	/**
	 * Function to create a comment
	 * @param {string} uid 
	 * @param {string} aid 
	 * @param {string} message 
	 * @returns {Promise<string>}
	 */
  async comment(uid, aid, message) {
    const user = await this.getUser(uid);
    const cid = nanoid();
		const now = new Date();
		const today = new Date(now);
		const test = new Date();
		test.setHours(today.getHours() + 11);
    const obj = {
      ownerName: user.username,
      ownerUid: uid,
      parentId: aid,
      aid: cid,
      message: message,
      time: test,
      likes: 0,
      likedUsers: [],
      userComments: [],
    }
    
    const activity = this.database.collection('activity');
    const query = { aid: aid };
    const activityResp = await activity.findOne(query);
    
    if (activityResp == null) {
      return -3;
    }
    
    let userComments = activityResp.userComments;
    userComments.push(cid);
    
    
    await activity.insertOne(obj);
    await activity.updateOne( query, { $set : { userComments: userComments } } );

    // Creating activity
    const users = this.database.collection('users');
    const userResp = await users.findOne({uid: activityResp.ownerUid});
    await this.createActivity(uid, `commented on ${userResp.username}'s activity 💬💬: "${activityResp.message}"`,aid);

    return cid;
  }

	/**
	 * Function to get array of comments 
	 * @param {string} aid 
	 * @returns {Promise<Array>}
	 */
  async getComments(aid) {
    const activity = this.database.collection('activity');
    const actResp = await activity.findOne({aid: aid});
    if (!actResp) {
      return -2;
    }
    let result = actResp;
    let comments = [];

    for (let i= 0; i < actResp.userComments.length; i++) {
      const element = actResp.userComments[i];
      comments.push(await this.getComments(element));
    }

    actResp.userComments = comments;

    return result;
  }

	/**
	 * Function to create like
	 * @param {string} uid 
	 * @param {string} id 
	 * @returns {Promise}
	 */
  async like(uid, id) {
    const users = this.database.collection('users');
    const activity = this.database.collection('activity');
    const activityResp = await activity.findOne({aid : id});

    if (activityResp == null) {
      return -2;
    }

    const userResp = await users.findOne({uid: activityResp.ownerUid});
    let likes = activityResp.likes;
    let likedUsers = activityResp.likedUsers;
    const index = likedUsers.indexOf(uid);
    let message = '';
    if (index === -1) {
      likedUsers.push(uid);
      message = `has liked ${userResp.username}'s post 👍👍: "${activityResp.message}"`;
    } else {
      likedUsers.splice(index, 1);
    }
    likes = likedUsers.length;
    await activity.updateOne({aid: id}, {$set: {likes: likes, likedUsers:likedUsers}});

    // Creating activity
    if (message !== '' ) {
      await this.createActivity(uid, message, id);
    }

    return id;
  }

	// Is this needed??
  async createStockColl(stock) {
    const stocks = this.database.collection('stocks');
    await stocks.insertOne({
      stock: stock,
      bear: [],
      bull: [],
    })
  }

	/**
	 * Function to vote on a stock
	 * type: 0 = bear, 1 = bull
	 * @param {string} uid 
	 * @param {string} stock 
	 * @param {int} type 
	 * @returns {Promise}
	 */
  async voteStock(uid, stock, type) {
    const stocks = this.database.collection('stocks');
    let stocksResp = await stocks.findOne({stock : stock});
    if (!stocksResp) {
      await this.createStockColl(stock);
      stocksResp = await stocks.findOne({stock : stock});
    }

    let bear = stocksResp.bear;
    let bull = stocksResp.bull;
    let message = '';

    if (type) { // Voted bullish
      let index = bull.indexOf(uid);
      if (index !== -1) {
        bull.splice(index, 1);
      } else {
        index = bear.indexOf(uid);
        if (index !== -1) {
          bear.splice(index, 1);
        }
        bull.push(uid);
        message = `voted ${stock} as bullish 🐮🐮`;
      }
    } else { // Voted bearish
      let index = bear.indexOf(uid);
      if (index !== -1) {
        bear.splice(index, 1);
      } else {
        index = bull.indexOf(uid);
        if (index !== -1) {
          bull.splice(index, 1);
        }
        bear.push(uid);
        message = `voted ${stock} as bearish 🐻🐻`;
      }
    }
    
    await stocks.updateOne({stock: stock}, {$set: {bull: bull, bear: bear}});

    // Creating activity
    if (message !== '') {
      await this.createActivity(uid, message, null);
    }

    return message;
  }

	/**
	 * Function to get the votes on a stock
	 * @param {string} uid 
	 * @param {string} stock 
	 * @returns {Promise<Object>}
	 */
  async getVotes(uid, stock) {
    const stocks = this.database.collection('stocks');
    let stocksResp = await stocks.findOne({stock : stock});
    if (!stocksResp) {
      await this.createStockColl(stock);
      stocksResp = await stocks.findOne({stock : stock});
    }
    let vote = "none"
    if (stocksResp.bear.indexOf(uid) !== -1) {
      vote = "bearish";
    } else if (stocksResp.bull.indexOf(uid) !== -1) {
      vote = "bullish";
    }
    let totalVotes = stocksResp.bear.length + stocksResp.bull.length;
    if (totalVotes === 0) {
      totalVotes = 1;
    }
    let bearPerc = stocksResp.bear.length / totalVotes;
    let bullPerc = stocksResp.bull.length / totalVotes;

    if ( bearPerc === 0 && bullPerc === 0) {
      bearPerc = .5;
      bullPerc = .5;
    }
    return {
      bear: (bearPerc.toFixed(2)) * 100,
      bull: (bullPerc.toFixed(2)) * 100,
      vote: vote,
    };
  }

	/**
	 * Function to get array of activities
	 * @param {string} uid 
	 * @returns {Promise<Array>}
	 */
  async getActivity(uid) {
    let activities = [];
    const userActivity = this.database.collection('userActivity');
    const activity = this.database.collection('activity');

    // Get friends' and user's activities
    const friends = await this.getFriends(uid);
    const celebs = await this.getUserCelebrities(uid);
    const everyone = [... friends, ... celebs];
    for (let i = 0; i < everyone.length; i++) {
      const e = everyone[i].uid;
      const userActResp = await userActivity.findOne({ownerUid: e});
      const userActs = userActResp.activities;
      const poop = await activity.find({aid: {$in: userActs}}).toArray();
      for (let index = 0; index < poop.length; index++) {
        const i = poop[index];
        if (await this.activityCanbeSeen(uid, i)){
          let newComments = [];
          for (let j = 0; j < i.userComments.length; j++) {
            const element = i.userComments[j];
            const comment = await activity.findOne({aid: element});
            if (comment !== null) {
              newComments.push(comment);
            }
          }
          i.userComments = newComments;
          activities.push(i);
        }
      }
    }
    
    activities.sort((first, second) => first.time - second.time);
    return activities;
  }
  
	/**
	 * Function to get activity of friends
	 * @param {string} uid 
	 * @param {string} friend 
	 * @returns {Promise<Array>}
	 */
  async getFriendActivity(uid, friend) {
    if (!await this.checkFriend(uid, friend)) {
      const celebrities = await this.getAllCelebrityUsers();
      const filtered = celebrities.filter((e) => e.uid === friend);
      if (filtered.length === 0) {
        return -2;
      }
    }
    let activities = [];
    const userActivity = this.database.collection('userActivity');
    const activity = this.database.collection('activity');

    // Get friends' and user's activities
    const userActResp = await userActivity.findOne({ownerUid: friend});
    const userActs = userActResp.activities;
    const poop = await activity.find({aid: {$in: userActs}}).toArray();
    for (let index = 0; index < poop.length; index++) {
      const i = poop[index];
      activities.push(i);
    }
    
    activities.sort((first, second) => first.time - second.time);
    return activities;
  }

	/**
	 * 
	 * @param {*} uid 
	 * @param {*} act 
	 * @returns 
	 */
  async activityCanbeSeen(uid, act) {
    let currAct = act;
    const activity = this.database.collection('activity');

    while (currAct.parentId !== null) {
      currAct = await activity.findOne({aid: currAct.parentId});
    }
    if (uid === currAct.ownerUid || await this.checkFriend(uid,currAct.ownerUid)) {
      return true;
    }
    return false;
  }

  async updateRankings(newRankings) {
    const rankings = this.database.collection('rankings');
    await rankings.deleteMany({});
    await rankings.insertMany(newRankings);
  }

  async getRankings() {
    const rankings = this.database.collection('rankings');
    const resp = await rankings.find().toArray();
    if (resp == null) return [];
    return resp;
  }

  /**
   * Connect to the database
   */
  async connect() {
    let uri = URI;
    if (this.testmode) {
      console.log("Starting in development mode...")
      // Start test server in memory
      this.mongoTestServer = await MongoMemoryServer.create();
      // Get uri string
      uri = this.mongoTestServer.getUri();
    } else {
      console.log("Starting in deployment mode...")
    }
    // Start client
    this.client = new MongoClient(uri);
    // Connect to server
    try {
      // console.log('Connecting to MongoDB database...');
      await this.client.connect();
      // console.log('Successfully connected to MongoDB database');
    } catch (err) {
      // console.error('Unable to connect to MongoDb database');
    }
    // Initialise database
    this.database = this.client.db(DATABASENAME);
    for (const collection of COLLECTIONS) {
      const cursor = this.database.listCollections({ name: collection });
      const hasNext = await cursor.hasNext();
      cursor.close();
      if (!hasNext) {
        // console.log(`Creating ${collection}`);
        await this.database.createCollection(collection);
      }
    }
    await this.onDatabaseConnect()
  }

  /**
  * This is called when the database first connects
  */
  async onDatabaseConnect() {
    await insertDefaultAdmin(this);
    calcAll(this.database);
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
