const mysql = require('mysql2');
const dbDetails = require('./yc_data');


const dbConnection = mysql.createConnection({
    host: dbDetails.host,
    user: dbDetails["user"],
    password: dbDetails.password,
    database:  dbDetails.database,

})

// Function to create the BASESENSOR table if it doesn't exist
async function createTableIfNotExists() {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS BASESENSOR (
          id INT AUTO_INCREMENT PRIMARY KEY,
          temperature FLOAT,
          humidity FLOAT
        )
      `;
      await dbConnection.execute(createTableQuery);
      console.log("Table BASESENSOR created or already exists.");
    } catch (error) {
      console.error("Error creating table:", error);
    }
  }
  
  // Call the function to create the table before running the server
//   createTableIfNotExists();


module.exports = {
    dbConnection,
    createTableIfNotExists,
};