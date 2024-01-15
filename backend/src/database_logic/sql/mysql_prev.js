const mysql = require("mysql2");
const { DEPLOYMENT, MYSQL, DOCKER } = require("../env.js");

let dbDetails;

if (DEPLOYMENT && !DOCKER) {
  dbDetails = require("../../yc_data.js");
} else if (!DEPLOYMENT) {
  dbDetails = require("../../yc_data_test.js");
}

let dbConnection;
if (DOCKER) {
  dbConnection = mysql.createConnection({
    host: MYSQL.HOST,
    user: MYSQL.USER,
    password: MYSQL.PASSWORD,
    database: MYSQL.DATABASE,
    waitForConnections: true,
    connectionLimit: 10, // Adjust according to your needs
    queueLimit: 0,
  });
} else if (MSSQL) {
    dbConnection = new mssql.ConnectionPool({
    host: MYSQL.HOST,
    user: MYSQL.USER,
    password: MYSQL.PASSWORD,
    database: MYSQL.DATABASE,
    waitForConnections: true,
    connectionLimit: 10, // Adjust according to your needs
    queueLimit: 0,
    });
    request = dbConnection.request();

} else {
  dbConnection = mysql.createConnection({
    host: dbDetails.host,
    user: dbDetails["user"],
    password: dbDetails.password,
    database: dbDetails.database,
  });
}

// // Wrap the connection setup in a function to handle asynchronous operations
// const connectToDatabase = async () => {
//   dbConnection = mysql.createConnection({
//     host: dbDetails.host,
//     user: dbDetails["user"],
//     password: dbDetails.password,
//     database: dbDetails.database,
//   });

//   // Promisify the connection to allow the use of async/await
//   return new Promise((resolve, reject) => {
//     dbConnection.connect((err) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// };

// Call the connectToDatabase function to establish the connection
// await connectToDatabase();

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

async function insertSensorValues(
  dateTime,
  microcontrollerId,
  plantBatch,
  temperature,
  humidity,
  brightness
) {
  await dbConnection.execute(
    "INSERT INTO SensorDetail (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (?, ?, ?, ?, ?, ?)",
    [dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness]
  );
}

async function getSensorDataByMicrocontrollerId(microcontrollerId) {
  queryResult = await dbConnection
    .promise()
    .query(
      "SELECT * FROM SensorDetail WHERE microcontrollerId = ?",
      microcontrollerId
    );
  return queryResult;
}

async function getAllSensorData() {
  queryResult = await dbConnection
    .promise()
    .query("SELECT * FROM SensorDetail");
  // console.log("hahahahha");
  // console.log(queryResult);
  return queryResult;
}
// Reassign more meaningful function name
initialiseMySQL = createTableIfNotExists;

module.exports = {
  dbConnection,
  insertSensorValues,
  getSensorDataByMicrocontrollerId,
  getAllSensorData,
  initialiseMySQL,
};
