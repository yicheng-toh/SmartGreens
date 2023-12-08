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
    
    // Create Microcontroller Plant Pair Table
    const createMicrocontrollerPlantPairTable = `
        CREATE TABLE IF NOT EXISTS MicrocontrollerPlantbatchPair (
        microcontrollerId INT,
        plantBatch INT,
        )
        `;

    // Create the Plant Batch table
    const createPlantBatchTable = `
        CREATE TABLE IF NOT EXISTS PlantDetail (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plantBatch INT,
        plantSpecies VARCHAR(100),
        positionLocation INT,
        positionLayer INT
        )
        `;

    await dbConnection.execute(createSensorDetailTable);
    // await dbConnection.execute(createMicrocontrollerLocationTable);
    await dbConnection.execute(createPlantBatchTable);
    // console.log("Tables created or already exists.");
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

// Reassign more meaningful function name
initialiseMySQL = createTableIfNotExists;

module.exports = {
  dbConnection,
  initialiseMySQL,
};
