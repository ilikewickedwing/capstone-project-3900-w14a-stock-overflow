import express from "express";
import cors from 'cors';
import { Database } from "./database";
import swaggerUI from 'swagger-ui-express';
import { swaggerDocs } from "./docs";
import { authLogin, authLogout, authRegister } from "./auth";

// Make the server instance
const app = express();

// Set the command line argument as the port. If not given, it is set as 5050
const PORT = process.argv.length > 2 ? Number(process.argv[2]) : 5050;

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
const database = new Database();
database.connect();

// Makes a GET endpoint for the server
app.get('/', (req, res) => {
  res.status(200).send('Mockup for Stockup');
})

// Post endpoint for logging into the server
/**
 * @swagger
 * /auth/login:
 *   post:
 *     description: Endpoint for logging in a user
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
 *         description: Returns the user token
 *       403:
 *         description: Invalid username and password combination
 */
app.post('/auth/login', (req, res) => {
  // Get the post parameter
  const { username, password } = req.body;
  const token = authLogin(username, password, database);
  // Valid so return token
  if (token !== null) {
    res.status(200).send({
      token: token
    });
    return;
  }
  // Invalid so send 403 response
  res.status(403).send();
})

// Post endpoint for logging into the server
/**
 * @swagger
 * /auth/logout:
 *   post:
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
app.post('/auth/logout', (req, res) => {
  // Get the post parameter
  const { token } = req.body;
  const resp = authLogout(token, database);
  if (resp) {
    res.status(200).send();
    return;
  }
  res.status(403).send();
})

// Post endpoint for logging into the server
/**
 * @swagger
 * /auth/register:
 *   post:
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
 *         description: Returns the user token
 *       403:
 *         description: Username already exists
 */
app.post('/auth/register', (req, res) => {
  // Get the post parameter
  const { username, password } = req.body;
  const token = authRegister(username, password, database);
  // Valid so return token
  if (token !== null) {
    res.status(200).send({
      token: token
    });
    return;
  }
  // Invalid so send 403 response
  res.status(403).send();
})

// Start the server instance
app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`)
})