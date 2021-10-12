import express from "express";
import cors from 'cors';
import { Database } from "./database";
import swaggerUI from 'swagger-ui-express';
import { swaggerDocs } from "./docs";
import { createPf, deletePf, openPf, userPfs, editPf } from "./portfolio";
import { authDelete, authLogin, authLogout, authRegister } from "./auth";
import { getUserProfile, postUserProfile } from "./user";

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
 *         buydate:
 *           type: date
 *           description: The buy in date of the stock
 *         buyprice:
 *           type: int
 *           description: The buy in price of the stock
 *       example:
 *         name: AAPL
 *         buydate: 10-10-2021
 *         buyprice: 500
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
  res.status(403).send({ mesage: 'Uid does not exist' });
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
  if (resp == null) {
    res.status(400).send({ message: "Portfolio name already in use" });
    return;
  } else if (resp == false) {
    res.status(401).send({ message: "Invalid token" });
    return;
  } else if (resp == 1) {
    res.status(400).send({ message: "Invalid portfolio name" });
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
  if (resp == 1) {
    res.status(401).send({ message: "Invalid token" });
  } else if (resp == 2) {
    res.status(404).send({ message: "Portfolios not found" });
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
  const { pid } = req.query;
  const resp = await openPf(pid, database);
  if (resp !== null) {
    res.status(200).send(resp);
    return;
  }
  res.status(403).send({ message: "Invalid pid" });
})

// Delete endpoint for deleting single portfolio
/**
 * @swagger
 * /user/portfolios/edit:
 *   post:
 *     tags: [Portfolio]
 *     description: endpoint for editing a single portfolio
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
  const resp = editPf(token, pid, name, database);
  if (resp == -1) {
    res.status(400).send({ message: "Name already in use" });
  } else if (resp == 2) {
    res.status(400).send({ message: "Invalid name" });
  } else if (resp == 3) {
    res.status(401).send({ message: "Invalid token" });
  } else if (resp == 4) {
    res.status(400).send({ message: "Invalid pid" });
  } else if (resp == 5) {
    res.status(403).send({ message: "Can not edit watchlist" });
  } else if (resp == 1) {
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
  const { token, pid } = req.query;
  const resp = await deletePf(token, pid, database);
  if (resp) {
    res.status(200).send(resp);
  } else if (resp == 1) {
    res.status(401).send({ message: "Invalid token" });
  } else if (resp == 2) {
    res.status(400).send({ message: "Invalid pid" });
  } else if (resp == 3) {
    res.status(403).send({ message: "Can not delete watchlist" });
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
 *      - name: amount
 *        description: The number of stocks to be added
 *        in: body
 *        required: true
 *        type: int
 *     responses:
 *       200:
 *         description: Successfully added stock
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Invalid pid
 *       404:
 *         description: Portfolio not found
 */
app.post('/user/stocks/add', async (req, res) => {
  const { token, pid, stock, price, amount } = req.body;
  const resp = await addStock(token, pid, stock, price, amount, database);
  if (resp == 1) {
    res.status(401).send({ message: "Invalid token" });
  } else if (resp == 2) {
    res.status(403).send({ message: "Invalid stock" });
  } else if (resp == 3) {
    res.status(404).send({ message: "Portfolio not found" });
  } else {
    res.status(200).send(resp);
  }
  return;
})

// Put endpoint for adding or removing stocks
/**
 * @swagger
 * /user/stocks/edit:
 *   put:
 *     tags: [Stock]
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
 *      - name: amount
 *        description: The number of stocks to be added
 *        in: body
 *        required: true
 *        type: int
 *      - name: option
 *        description: 0 = sell, else buy
 *        in: body
 *        required: true
 *        type: int
 *     responses:
 *       200:
 *         description: Successfully deleted portfolio
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Invalid stock
 *       403:
 *         description: Quantity too high
 *       404:
 *         description: Portfolio not found
 *       404:
 *         description: Stock not in portfolio
 */
app.put('/user/stocks/edit', async (req, res) => {
  const { token, pid, stock, price, amount, option } = req.body;
  const resp = await modifyStock(token, pid, stock, price, amount, option, database);
  if (resp == 1) {
    res.status(401).send({ message: "Invalid token" });
  } else if (resp == 2) {
    res.status(403).send({ message: "Invalid stock" });
  } else if (resp == 3) {
    res.status(404).send({ message: "Portfolio not found" });
  } else if (resp == 4) {
    res.status(403).send({ message: "Quantity to sell too high" });
  } else if (resp == 5) {
    res.status(404).send({ message: "Stock is not in portfolio" });
  } else {
    res.status(200).send(resp);
  }
  return;
})

// Get endpoint for getting every active stock
/**
 * @swagger
 * /user/stocks/all:
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
app.get('/user/stocks/all', async (req, res) => {
  const resp = await getAllStocks();
  if (resp == null) {
    res.status(502).send({ message: "Could not connect to API" });
    return;
  }
  res.status(200).send(resp);
  return;
})