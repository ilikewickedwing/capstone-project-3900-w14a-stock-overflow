/**
 * This is the file that the program starts grom
*/

import { app } from "./index";

// Set the command line argument as the port. If not given, it is set as 5050
const PORT = process.argv.length > 2 ? Number(process.argv[2]) : 5050;

// Start the server instance
app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`)
})