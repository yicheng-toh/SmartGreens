const mysql = require("mysql2");
const dbDetails = require("./yc_data");

const dbConnection = mysql.createConnection({
  host: dbDetails.host,
  user: dbDetails["user"],
  password: dbDetails.password,
  database: dbDetails.database,
});

// Function to create the BASESENSOR table if it doesn't exist
async function createTableIfNotExists() {
  try {
    //   const createTableQuery = `
    //     CREATE TABLE IF NOT EXISTS BASESENSOR (
    //       id INT AUTO_INCREMENT PRIMARY KEY,
    //       temperature FLOAT,
    //       humidity FLOAT
    //     )
    //   `;
    // Create the Sensor Detail table
    const createSensorDetailTable = `
        CREATE TABLE IF NOT EXISTS SensorDetail (
        dateTime DATETIME,
        microcontrollerId INT,
        plantBatch INT,
        temperature FLOAT,
        humidity INT,
        brightness INT
        )
        `;


    // // Create the Microcontroller Location table
    // const createMicrocontrollerLocationTable = `
    //     CREATE TABLE MicrocontrollerLocation (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     microcontrollerId INT,
    //     position INT
    //     )
    //     `;
    // Create the Microcontroller to plantBatch table
    // const createMicroControllertoPlantBatchTable = `
    //     CREATE TABLE IF NOT EXISTS PlantInfo(
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     plantBatch INT,
    //     plantSpecies VARCHAR(255),
    //     positionLocation INT,
    //     positionLayer INT
    //     )
    //     `;

    // Create the Plant Batch table
    const createPlantBatchTable = `
        CREATE TABLE IF NOT EXISTS PlantBatch (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plantBatch INT,
        plantSpecies VARCHAR(255),
        positionLocation INT,
        positionLayer INT
        )
        `;

    await dbConnection.execute(createSensorDetailTable);
    // await dbConnection.execute(createMicrocontrollerLocationTable);
    await dbConnection.execute(createPlantBatchTable);
    console.log("Tables created or already exists.");
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
