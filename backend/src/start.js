/**
 * This is the file that the program starts grom
*/

import { app, database } from "./index";

// Set the command line argument as the port. If not given, it is set as 5050
let PORT = Number(process.argv[process.argv.length - 1]);
if (isNaN(PORT)) {
  PORT = 5050;
}

// Set to deployment mode
if (process.argv[2] === 'deploy') {
  database.testmode = false;
}
// Start database
database.connect();

// Start the server instance
app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`)
})