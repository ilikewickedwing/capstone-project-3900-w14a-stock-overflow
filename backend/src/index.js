import express from "express";
import cors from 'cors';

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

// Makes a GET endpoint for the server
app.get('/', (req, res) => {
  res.status(200).send('Mockup for Stockup');
})

// Makes a POST endpoint for the server
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