import express from "express";
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import { swaggerDocs } from "./docs";

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

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//                  Endpoint definitons below                   //
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

// Makes a GET endpoint for the server
app.get('/', (req, res) => {
  res.status(200).send('Mockup for Stockup');
})

// Makes a POST endpoint for the server
// The @swagger comment is used by the automatic documentation
// generator
/**
 * @swagger
 * /dummy:
 *   post:
 *     description: Dummy endpoint accepting post requests
 *     parameters:
 *      - name: dummyParam
 *        description: title of the book
 *        in: body
 *        required: true
 *        type: object
 *     responses:
 *       200:
 *         description: Success
 */
app.post('/dummy', (req, res) => {
  // Get the post parameter
  const param = req.body.myParam;
  const dummyResponse = {
    user: `Stockman ${param}`,
    catchline: `Stocks are for blocks` 
  }
  // Return a response to the client calling this endpoint
  res.status(200).send(dummyResponse);
})

// Start the server instance
app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`)
})