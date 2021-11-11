import express, { query } from "express";
import cors from 'cors';
import { Database } from "./database";
import swaggerUI from 'swagger-ui-express';
import { swaggerDocs } from "./docs";
import { createPf, deletePf, openPf, userPfs, getPid, editPf } from "./portfolio";
import { calcPf } from "./performance";
import { authDelete, authLogin, authLogout, authRegister } from "./auth";
import { getDefBroker, getUserProfile, postUserProfile, setDefBroker } from "./user";
import { addStock, modifyStock, getAllStocks, checkStock, getStock } from "./stocks";
import { getAdminCelebrityRequests, postAdminCelebrityHandlerequest, postCelebrityMakeRequest } from "./admin";
import { getUserNotifications, deleteUserNotifications } from "./notifications";
import fileUpload from 'express-fileupload';
import { handleFileDownload, handleFileUpload } from "./file";
import { getCelebrityDiscover, postCelebrityFollow } from "./celebrity";

// Make the server instance
export const app = express();

// Attach a CORS middleware for the server
// Cors is a security mechanism that browsers implement that prevent
// websites from different domain names to communicate to each other
// we need to explicitly enable them to communicate or a browser will block
// all API calls from the frontend to the backend
// More about CORS here: https://www.youtube.com/watch?v=4KHiSt0oLJ0&ab_channel=Fireship
app.use(cors());

// Middleware to parse JSON
app.use(express.json())

// Middleware used to generate automatic REST API documentation
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Middleware for file uploads
app.use(fileUpload({ createParentPath: true }));

// Intialise database
export const database = new Database();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *           description: The uid of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *       example:
 *         uid: 9ThIGIrYNeSNIVuMa2jGU
 *         username: XStockMaster64X
 *     Portfolio:
 *       type: object
 *       properties:
 *         pid:
 *           type: string
 *           description: The pid of the portfolio
 *         name:
 *           type: string
 *           description: The name of the portfolio
 *       example:
 *         pid: r6UeE86Z4dbYnMhqeJLD
 *         name: myPortfolio
 *     Stock:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the stock
 *         avgPrice:
 *           type: int
 *           description: The buy in price of the stock
 *         quantity:
 *           type: int
 *           description: The amount bought of the stock
 *       example:
 *         name: AAPL
 *         avgPrice: 500
 *         quantity: 20
 *     UserData:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *       example:
 *         username: XStockMaster64X
 */
app.get('/', (req, res) => {
  res.status(200).send('This is the root page. Go to /docs for documentation.')
})

// Get endpoint for getting user data
/**
 * @swagger
 * /user/profile:
 *   get:
 *     tags: [User]
 *     description: Endpoint for fetching a users profile
 *     parameters:
 *      - name: uid
 *        description: The uid of the user
 *        example: 9ThIGIrYNeSNIVuMa2jGU
 *        in: body
 *        required: true
 *        type: string
 *      - name: token
 *        description: The token of the user
 *        example: 9ThIGIrYNeSNIVuMa2jGU
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the user profile information
 *         schema:
 *             $ref: '#/components/schemas/User'
 *       403:
 *         description: Invalid uid or invalid user permissions
 */
app.get('/user/profile', async (req, res) => {
  const { uid, token } = req.query;
  const resp = await getUserProfile(uid, token, database);
  if (resp !== null) {
    res.status(200).send(resp);
    return;
  }
  res.status(403).send({ message: 'Invalid uid' });
})

// Get endpoint for editing user data
/**
 * @swagger
 * /user/profile:
 *   post:
 *     tags: [User]
 *     description: Endpoint for editing a users profile
 *     parameters:
 *      - name: uid
 *        description: The uid of the user
 *        example: 9ThIGIrYNeSNIVuMa2jGU
 *        in: body
 *        required: true
 *        type: string
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: userData
 *        description: The new data of the user. Any attributes not given will not be changed
 *        in: body
 *        schema:
 *             $ref: '#/components/schemas/UserData'
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: User profile has been changed
 *       400:
 *         description: Invalid token or username already exists
 *       403:
 *         description: Incorrect priveleges or invalid uid
 */
app.post('/user/profile', async (req, res) => {
  // TODO
  const { uid, token, userData } = req.body;
  await postUserProfile(uid, token, userData, database, res);
  // if (resp) {
  //   res.status(200).send();
  //   return;
  // }
  // res.status(403).send({ message: 'Invalid token or uid' });
})

// Post endpoint for logging into the server
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     description: Endpoint for logging in a user
 *     parameters:
 *      - name: username
 *        description: The username of the user
 *        example: BobDylan24
 *        in: body
 *        required: true
 *        type: string
 *      - name: password
 *        description: The password of the user
 *        example: My password
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the user token and uid
 *         schema:
 *            type: object
 *            properties:
 *              uid:
 *                type: string
 *                description: The uid of the user
 *              token:
 *                type: string
 *                description: The token of the session
 *            
 *       403:
 *         description: Invalid username and password combination
 */
app.post('/auth/login', async (req, res) => {
  // Get the post parameter
  const { username, password } = req.body;
  const resp = await authLogin(username, password, database);
  // Valid so return token
  if (resp !== null) {
    res.status(200).send(resp);
    return;
  }
  // Invalid so send 403 response
  res.status(403).send({ message: 'Invalid username and password combination' });
})

// Post endpoint for logging into the server
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     description: Endpoint for logging out a user
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Token has been invalidated
 *       403:
 *         description: Invalid token
 */
app.post('/auth/logout', async (req, res) => {
  // Get the post parameter
  const { token } = req.body;
  const resp = await authLogout(token, database);
  if (resp) {
    res.status(200).send();
    return;
  }
  res.status(403).send({ message: 'Invalid token' });
})

// Post endpoint for logging into the server
/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     description: Endpoint for registering a user
 *     parameters:
 *      - name: username
 *        description: The username of the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: password
 *        description: The password of the user
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the user token and uid
 *         schema:
 *            type: object
 *            properties:
 *              uid:
 *                type: string
 *                description: The uid of the user
 *              token:
 *                type: string
 *                description: The token of the session
 *       403:
 *         description: Username already exists
 */
app.post('/auth/register', async (req, res) => {
  // Get the post parameter
  const { username, password } = req.body;
  // Make sure username and password arent empty
  if (username.length === 0 || password.length === 0) {
    res.status(403).send({ message: 'Cannot have empty username or password' });
    return;
  }
  const resp = await authRegister(username, password, database);
  // Valid so return token
  if (resp !== null) {
    res.status(200).send(resp);
    return;
  }
  // Invalid so send 403 response
  res.status(403).send({ message: 'username already exists' });
})

// Delete endpoint for removing user from server
/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     tags: [Authentication]
 *     description: Endpoint for deleting a user account
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Successfully deleted account
 *       403:
 *         description: Invalid token
 */
app.delete('/auth/delete', async (req, res) => {
  // Get the post parameter
  const { token } = req.body;
  const resp = await authDelete(token, database);
  if (resp) {
    res.status(200).send();
    return;
  }
  res.status(403).send({ message: 'Uid does not exist' });
})

// Get endpoint for getting default broker price
app.get('/user/getDefBroker', async (req, res) => {
  const { token } = req.query;
  const resp = await getDefBroker(token, database);
  console.log
  if (resp === 2) {
    res.status(401).send({ error: "Invalid token" });
  } else {
    res.status(200).send({ defBroker: resp });
  }
})

// Post endpoint for setting default broker price
app.post('/user/setDefBroker', async (req, res) => {
  const { token, defBroker, brokerFlag } = req.body;
  const resp = await setDefBroker(token, defBroker, brokerFlag, database);
  if (resp === 2) {
    res.status(401).send({ error: "Invalid token" });
  } else if (resp === 3) {
    res.status(403).send({ error: "Invalid brokerage fee" });
  } else if (resp === 4) {
    res.status(403).send({ error: "Invalid brokerage type" });
  } else if (resp === 0) {
    res.status(404).send();
  } else if (resp === 1) {
    res.status(200).send();
  }
})

// Post endpoint for creating a single portfolio
/**
 * @swagger
 * /user/portfolios/create:
 *   post:
 *     tags: [Portfolio]
 *     description: Endpoint for creating a single portfolio
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: name
 *        description: The name of the portfolio
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the portfolio id and name
 *         schema:
 *            type: object
 *            $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Invalid name or portfolio name already in use
 *       403: 
 *         description: Invalid token
 */
app.post('/user/portfolios/create', async (req, res) => {
  const { token, name } = req.body;
  const resp = await createPf(token, name, database);
  if (resp === null) {
    res.status(400).send({ error: "Portfolio name already in use" });
    return;
  } else if (resp === false) {
    res.status(401).send({ error: "Invalid token" });
    return;
  } else if (resp === 1) {
    res.status(400).send({ error: "Invalid portfolio name" });
  } else res.status(200).send(resp);
  return;
})

// Get endpoint for getting user portfolios
/**
 * @swagger
 * /user/portfolios:
 *   get:
 *     tags: [Portfolio]
 *     description: Endpoint for getting user portfolios
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the portfolios array
 *         schema:
 *            type: array
 *            properties:
 *              portfolio:
 *                $ref: '#/components/schemas/Portfolio'
 *       403: 
 *         description: Invalid uid
 */
app.get('/user/portfolios', async (req, res) => {
  const { token } = req.query;
  const resp = await userPfs(token, database);
  if (resp === 1) {
    res.status(401).send({ error: "Invalid token" });
  } else if (resp === 2) {
    res.status(404).send({ error: "Portfolios not found" });
  } else { 
    res.status(200).send(resp);
  }
})

// Get endpoint for opening single portfolio
/**
 * @swagger
 * /user/portfolios/open:
 *   get:
 *     tags: [Portfolio]
 *     description: Endpoint for opening a single portfolio
 *     parameters:
 *      - name: pid
 *        description: The id of the portfolio
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the portfolio
 *         schema:
 *            type: object
 *            properties:
 *              portfolioId:
 *                type: string
 *                description: The pid of the portfolio
 *              name:
 *                type: string
 *                description: The name of the portfolio
 *              stock:
 *                $ref: '#/components/schemas/Stock'
 *       403: 
 *         description: Invalid pid
 */
app.get('/user/portfolios/open', async (req, res) => {
  const { token, pid } = req.query;
  const resp = await openPf(token, pid, database);
  if (resp === null) {
    res.status(403).send({ error: "Invalid pid" });
  } else if (resp === 1) {
    res.status(401).send({ error: "Invalid token" });
  } else if (resp === 2) {
    res.status(401).send({ error: "You do not have access to this portfolio" });
  } else {
    res.status(200).send(resp);
  }
})


// Get endpoint for getting the pid of a single portfolio
/**
 * @swagger
 * /user/portfolios/getPid:
 *   get:
 *     tags: [Portfolio]
 *     description: Endpoint for getting a pid
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: pid
 *        description: The id of the portfolio
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the portfolio
 *         schema:
 *            type: object
 *            properties:
 *              portfolioId:
 *                type: string
 *                description: The pid of the portfolio
 *       401:
 *         description: Invalid token
 *       403: 
 *         description: Invalid name
 */
app.get('/user/portfolios/getPid', async (req, res) => {
  const { token, name } = req.query;
  const resp = await getPid(token, name, database);
  if (resp === 1) {
    res.status(401).send({ error: "Invalid token" });
  } else if (resp === null) {
    res.status(403).send({ error: "Invalid name" });
  } else {
    res.status(200).send(resp);
  }

  return;
})

// Get endpoint for calculating a single portfolio performance
/**
 * @swagger
 * /user/portfolios/calculate:
 *   get:
 *     tags: [Portfolio]
 *     description: Endpoint for calculating a single portfolio performance
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: pid
 *        description: The id of the portfolio
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the portfolio performance as a percentage
 *         schema:
 *            type: object
 *            properties:
 *              performance]:
 *                type: string
 *                description: The performance of the portfolio
 *       401:
 *         description: Invalid token, or invalid user
 *       403: 
 *         description: Invalid pid, watchlist performance not existent
 */
app.get('/user/portfolios/calculate', async (req, res) => {
  const { token, pid } = req.query;
  const resp = await calcPf(token, pid, database);
  if (resp === -1) {
    res.status(401).send({ error: "You do not have access to this portfolio" });
  } else if (resp === -2) {
    res.status(401).send({ error: "Invalid token" });
  } else if (resp === -3) {
    res.status(403).send({ error: "Invalid pid" });
  } else if (resp === -4) {
    res.status(403).send({ error: "Can not perform for watchlist" });
  } else if (resp === -5) {
    res.status(404).send({ error: "Could not update database" });
  } else {
    res.status(200).send({ performance: resp });
  }

  return;
})

// Delete endpoint for deleting single portfolio
/**
 * @swagger
 * /user/portfolios/edit:
 *   post:
 *     tags: [Portfolio]
 *     description: endpoint for editing a single portfolio name
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: pid
 *        description: The id of the portfolio
 *        in: body
 *        required: true
 *        type: string
 *      - name: name
 *        description: The name of the portfolio
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Portfolio has been changed
 *       400:
 *         description: Invalid name or pid
 *       403: 
 *         description: Invalid token, or watchlist edit attempted
 */
app.post('/user/portfolios/edit', async (req, res) => {
  const { token, pid, name } = req.body;
  const resp =  await editPf(token, pid, name, database);
  if (resp === -1) {
    res.status(400).send({ error: "Name already in use" });
  } else if (resp === 2) {
    res.status(400).send({ error: "Invalid name" });
  } else if (resp === 3) {
    res.status(401).send({ error: "Invalid token" });
  } else if (resp === 4) {
    res.status(400).send({ error: "Invalid pid" });
  } else if (resp === 5) {
    res.status(403).send({ error: "Can not edit watchlist" });
  } else if (resp === 6) {
    res.status(401).send({ error: "You do not have access to this portfolio" });
  } else if (resp === 1) {
    res.status(200).send();
  } else {
    res.status(404).send();
  }
})

// Delete endpoint for deleting single portfolio
/**
 * @swagger
 * /user/portfolios/delete:
 *   delete:
 *     tags: [Portfolio]
 *     description: endpoint for deleting a single portfolio
 *     parameters:
 *      - name: pid
 *        description: The id of the portfolio
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Successfully deleted portfolio
 *       400:
 *         description: Invalid pid 
 *       403:
 *         description: Invalid token or watchlist deletion attempted
 */
app.delete('/user/portfolios/delete', async (req, res) => {
  const { token, pid } = req.body;
  const resp = await deletePf(token, pid, database);
  if (resp === 1) {
    res.status(200).send();
  } else if (resp === 2) {
    res.status(401).send({ error: "Invalid token" });
  } else if (resp === 3) {
    res.status(400).send({ error: "Invalid pid" });
  } else if (resp === 4) {
    res.status(403).send({ error: "Can not delete watchlist" });
  } else if (resp === 0) {
    res.status(500).send({ error: "Portfolio not deleted" });
  } else if (resp === -1) {
    res.status(401).send({ error: "You do not have access to this portfolio" });
  }
})

// Post endpoint for adding a stock to a portfolio
/**
 * @swagger
 * /user/stocks/add:
 *   post:
 *     tags: [Stocks]
 *     description: endpoint for adding a stock to a portfolio
 *     parameters:
 *      - name: token
 *        description: User's token
 *        in: body
 *        required: true
 *        type: string
 *      - name: pid
 *        description: The id of the portfolio
 *        in: body
 *        required: true
 *        type: string
 *      - name: stock
 *        description: The symbol/stock that is to be added
 *        in: body
 *        required: true
 *        type: string
 *      - name: price
 *        description: The price of each individual stock
 *        in: body
 *        required: true
 *        type: float
 *      - name: quantity
 *        description: The number of stocks to be added
 *        in: body
 *        required: true
 *        type: int
 *      - name: brokerage
 *        description: The price of the brokerage fee
 *        in: body
 *        required: true
 *        type: float
 *      - name: flag
 *        description: The type of the brokerage fee; 0 for flat and 1 for percentage
 *        in: body
 *        required: true
 *        type: int
 *     responses:
 *       200:
 *         description: Successfully added stock
 *       400:
 *         description: Invalid quantity or price
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Invalid pid or invalid stock
 */
app.post('/user/stocks/add', async (req, res) => {
  const { token, pid, stock, price, quantity, brokerage, flag } = req.body;
  const resp = await addStock(token, pid, stock, price, quantity, brokerage, flag, database);
  if (resp === 1) {
    res.status(401).send({ error: "Invalid token" });
  } else if (resp === 2) {
    res.status(403).send({ error: "Invalid stock" });
  } else if (resp === 3) {
    res.status(403).send({ error: "Invalid pid" });
  } else if (resp === 4) {
    res.status(400).send({ error: "Must include valid quantity purchased" });
  } else if (resp === 5) {
    res.status(400).send({ error: "Must include valid price purchased at" });
  } else if (resp === 6) {
    res.status(403).send({ error: "Stock already in watchlist" });
  } else if (resp === 7) {
    res.status(403).send({ error: "Default brokerage cost not set" });
  } else if (resp === 8) {
    res.status(403).send({ error: "Invalid brokerage cost" });
  } else if (resp === 9) {
    res.status(403).send({ error: "Invalid brokerage type" });
  } else {
    res.status(200).send();
  }
  return;
})

// Put endpoint for adding or removing stocks
/**
 * @swagger
 * /user/stocks/edit:
 *   put:
 *     tags: [Stocks]
 *     description: endpoint for adding or removing stocks
 *     parameters:
 *      - name: token
 *        description: User's token
 *        in: body
 *        required: true
 *        type: string
 *      - name: pid
 *        description: The id of the portfolio
 *        in: body
 *        required: true
 *        type: string
 *      - name: stock
 *        description: The symbol/stock that is to be added
 *        in: body
 *        required: true
 *        type: string
 *      - name: price
 *        description: The price of each individual stock
 *        in: body
 *        required: true
 *        type: float
 *      - name: quantity
 *        description: The number of stocks to be added
 *        in: body
 *        required: true
 *        type: int
 *      - name: option
 *        description: 0 = sell, else buy
 *        in: body
 *        required: true
 *        type: int
 *      - name: brokerage
 *        description: The price of the brokerage fee
 *        in: body
 *        required: true
 *        type: float
 *      - name: flag
 *        description: The type of the brokerage fee; 0 for flat and 1 for percentage
 *        in: body
 *        required: true
 *        type: int
 *     responses:
 *       200:
 *         description: Successfully deleted portfolio
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Invalid stock or Quantity too high or Invalid pid
 *       404:
 *         description: Stock not in portfolio
 */
app.put('/user/stocks/edit', async (req, res) => {
  const { token, pid, stock, price, quantity, option, brokerage, flag } = req.body;
  const resp = await modifyStock(token, pid, stock, price, quantity, option, brokerage, flag, database);
  if (resp === -1) {
    res.status(200).send();
  } else if (resp === 1) {
    res.status(401).send({ error: "Invalid token" });
  } else if (resp === 2) {
    res.status(403).send({ error: "Invalid stock" });
  } else if (resp === 3) {
    res.status(403).send({ error: "Invalid pid" });
  } else if (resp === 4) {
    res.status(403).send({ error: "Quantity to sell too high" });
  } else if (resp === 5) {
    res.status(404).send({ error: "Stock is not in portfolio" });
  } else if (resp === 6) {
    res.status(400).send({ error: "Must include valid quantity sold" });
  } else if (resp === 7) {
    res.status(400).send({ error: "Must include valid price sold at" });
  } else if (resp === 8) {
    res.status(403).send({ error: "Invalid brokerage cost" });
  } else if (resp === 9) {
    res.status(403).send({ error: "Default brokerage cost not set" });
  } else if (resp === 10) {
    res.status(403).send({ error: "Invalid brokerage type" });
  }
  return;
})

// Get endpoint for getting every active stock
/**
 * @swagger
 * /stocks/all:
 *   get:
 *     tags: [Stocks]
 *     description: endpoint for getting every active stock
 *     parameters:
 *     responses:
 *       200:
 *         description: Successfully returned every active stock
 *       502:
 *         description: Could not connect to API
 */
app.get('/stocks/all', async (req, res) => {
  const resp = await getAllStocks();
  if (resp === null) {
    res.status(502).send({ error: "Could not connect to API" });
    return;
  }
  res.status(200).send(resp);
  return;
})

// Get endpoint for searching for stock info
/**
 * @swagger
 * /stocks/info:
 *   get:
 *     tags: [Stocks]
 *     description: endpoint for getting stock information - uses alphavantage for information, and tradier for prices
 *     parameters:
 *      - name: type
 *        description: The type of call being made;
 *          0. Information overview of stock;
 *          1. Current price of stock(s);
 *          2. History of one stock not intraday;
 *          3. History of one stock intraday
 *        in: body
 *        required: true
 *        type: string
 *      - name: stocks
 *        description: The symbol of the stock or stocks
 *        in: body
 *        required: true
 *        type: string
 *      - name: interval
 *        description: The interval needed;
 *          For not intraday, options are daily, weekly, monthly;
 *          For intraday, options are 1min, 5min, 15min
 *        in: body
 *        required: false
 *        type: string
 *      - name: start
 *        description: The start of the time from when to get data;
 *          For not intraday, format is string as YYYY-MM-DD;
 *          For intraday, format is string as YYYY-MM-DD HH:MM
 *        in: body
 *        required: false
 *        type: string
 *     responses:
 *       200:
 *         description: Successfully returned information for single stock
 *       403:
 *         description: Invalid stock, type, interval, start
 *       502:
 *         description: Could not connect to API
 */
app.get('/stocks/info', async (req, res) => {
  const { type, stocks, interval, start } = req.query;
  const resp = await getStock(type, stocks, interval, start);

  if (resp === -1) {
    res.status(403).send({ error: "Invalid stock" });
  } else if (resp === -2) {
    res.status(403).send({ error: "Invalid type" });
  } else if (resp === -3) {
    res.status(403).send({ error: "Invalid interval" });
  } else if (resp === -4) {
    res.status(403).send({ error: "Invalid start" });
  } else if (resp === null) {
    res.status(502).send({ error: "Could not connect to API" });
  } else res.status(200).send(resp);

  return;
})

/**
 * @swagger
 * /user/notifications:
 *   get:
 *     tags: [User]
 *     description: Get the recent notifications for the user
 *     parameters:
 *      - name: token
 *        description: The token of the admin
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the an array of notifications
 *         schema:
 *            type: object
 *            properties:
 *              requests:
 *                type: array
 *                description: An array of notifications
 *       401:
 *         description: Invalid token
 */
app.get('/user/notifications', async (req, res) => {
  const { token } = req.query;
  getUserNotifications(token, database, res);
})

app.delete('/user/notifications/clear', async (req, res) => {
  const { token } = req.body;
  deleteUserNotifications(token, database, res);
})

/**
 * @swagger
 * /celebrity/makerequest:
 *   post:
 *     tags: [Celebrity]
 *     description: User makes a request to be a celebrity
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: info
 *        description: The information the celebrity wants to provide to the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: fids
 *        description: An array of the file ids uploaded with the request
 *        in: body
 *        required: true
 *        type: array
 *     responses:
 *       200:
 *         description: Returns the rid
*         schema:
 *            type: object
 *            properties:
 *              rid:
 *                type: string
 *                description: rid of request
 *       400:
 *         description: fids contain an invalid fid
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Request has already been made
 */
app.post('/celebrity/makerequest', async (req, res) => {
  const { token, info, fids } = req.body;
  await postCelebrityMakeRequest(token, info, fids, database, res);
})

/**
 * @swagger
 * /admin/celebrity/requests:
 *   get:
 *     tags: [Celebrity]
 *     description: Endpoint to return a list of celebrities to discover
 *     responses:
 *       200:
 *         description: Returns the an array of celebrities
 *         schema:
 *            type: object
 *            properties:
 *              celebrities:
 *                type: array
 *                description: An array of the celebrities
 */
app.get('/celebrity/discover', async (req, res) => {
  getCelebrityDiscover(res, database);
})

/**
 * @swagger
 * /celebrity/follow:
 *   post:
 *     tags: [Celebrity]
 *     description: User makes a request to follow a given celebrity
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: isFollow
 *        description: Set to true when following. Set to false when unfollowing
 *        in: body
 *        required: true
 *        type: boolean
 *      - name: celebUid
 *        description: The user id of the celeb to follow
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Everything went well
 *       400:
 *         description: You can't follow a celeb you already follow, 
 *          or unfollow a celeb you arent following, or celebUid doesnt exist,
 *          or uid is not a celebrity
 *       401:
 *         description: Invalid token
 */
app.post('/celebrity/follow', async (req, res) => {
  const { token, isFollow, celebUid } = req.body;
  await postCelebrityFollow(token, isFollow, celebUid, res, database);
})

/**
 * @swagger
 * /admin/celebrity/requests:
 *   get:
 *     tags: [Admin]
 *     description: Get endpoint for admin to fetch a list of all requests to be a celebrity
 *     parameters:
 *      - name: token
 *        description: The token of the admin
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the an array of celebrity requests
 *         schema:
 *            type: object
 *            properties:
 *              requests:
 *                type: array
 *                description: An array of the celebrity requests
 *              users:
 *                type: object
 *                description: An object mapping the uid to the user data
 *       401:
 *         description: Invalid token
 *       403:
 *         description: User is not an admin
 */
app.get('/admin/celebrity/requests', async (req, res) => {
  const { token } = req.query;
  await getAdminCelebrityRequests(token, database, res);
})

/**
 * @swagger
 * /admin/celebrity/handlerequest:
 *   post:
 *     tags: [Admin]
 *     description: Get endpoint for admin to fetch a list of all requests to be a celebrity
 *     parameters:
 *      - name: token
 *        description: The token of the admin
 *        in: body
 *        required: true
 *        type: string
 *      - name: approve
 *        description: Whether to approve or reject the request
 *        in: body
 *        required: true
 *        type: boolean
 *      - name: rid
 *        description: The id of the request to approve or reject
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Everything went okay
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Not an admin
 *       400:
 *         description: Invalid rid
 */
app.post('/admin/celebrity/handlerequest', async (req, res) => {
  const { token, approve, rid } = req.body;
  await postAdminCelebrityHandlerequest(token, approve, rid, database, res);
})

// Post endpoint for uploading files
/**
 * @swagger
 * /file/upload:
 *   post:
 *     tags: [File]
 *     description: Post endpoint for uploading file
 *     parameters:
 *      - name: token
 *        description: The token of the user uploading
 *        in: header
 *        required: true
 *        type: string
 *      - name: upload
 *        description: The data of the object
 *        in: body
 *        required: true
 *        type: form-data-file
 *     responses:
 *       200:
 *         description: Everything went okay
 *       401:
 *         description: Invalid token
 */
app.post('/file/upload', async (req, res) => {
  await handleFileUpload(req, res, database);
})

/**
 * @swagger
 * /file/download:
 *   get:
 *     tags: [File]
 *     description: Get endpoint for downloading a file
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: header
 *        required: true
 *        type: string
 *      - name: fid
 *        description: The file id
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Everything went okay
 *         schema:
 *            type: object
 *            properties:
 *              filename:
 *                type: string
 *                description: Name of file
 *              data:
 *                type: string
 *                description: Base64 encoding of the file
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Invalid permissions
 */
app.get('/file/download', async (req, res) => {
  const { token, fid } = req.query;
  await handleFileDownload(token, fid, res, database);
})

app.get('/rankings/global', async (req, res) => {
  const resp = await getRankings(database);
  if (rank !== null) {
    res.status(200).send(resp);
  } else res.status(404).send({ error: "A system error occurred" });
})