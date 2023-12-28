const sqlite3 = require("sqlite3");
const {DEPLOYMENT} = require("../env.js");
// const { router } = require("../routes/sqlite3_route");
// const { sendInternalServerError } = require("./request_error_messages");

let sqliteFile;
const DEPLOYMENT_DB = "mydatabase.db";
const TEST_DB = "mydatabase_test.db";

if (DEPLOYMENT) {
  sqliteFile = DEPLOYMENT_DB;
}else {
  sqliteFile = TEST_DB;
}

function initialiseSqlite3() {
    // Initialize the SQLite database connection
    // TODO : to ensure that all the errors are caught.
    const db = new sqlite3.Database(sqliteFile, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error('Error connecting to the SQLite database:', err);
      } else {
        console.log('Connected to the SQLite database');
      }
    });

    return db;
}

function createTableIfNotExists(db) {
  // Initialize the SQLite database connection
  // TODO : to ensure that all the errors are caught.
  console.log("Initialising table");
  db.run(`
        CREATE TABLE IF NOT EXISTS SensorDetail (
        dateTime DATETIME,
        microcontrollerId INT,
        plantBatch INT,
        temperature FLOAT,
        humidity INT,
        brightness INT
        )
        `);

  db.run(`
        CREATE TABLE IF NOT EXISTS MicrocontrollerPlantbatchPair (
        microcontrollerId INT,
        plantBatch INT
        )
        `);

  db.run(`
        CREATE TABLE IF NOT EXISTS PlantDetail (
        plantBatch INT,
        plantSpecies VARCHAR(100),
        positionLocation INT,
        positionLayer INT
        )
        `);
  return db;
}

const getSensorDataByMicrocontrollerId = (microcontrollerId, db) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM SensorDetail WHERE microcontrollerId = ?', microcontrollerId, (err, rows) => {
        if (err) {
          console.error('Error retrieving data:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  };

const getAllSensorData = (db) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM SensorDetail', (err, rows) => {
        if (err) {
          console.error('Error retrieving data:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  };


const insertSensorValues = (dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness, db) => {
    db.run('INSERT INTO SensorDetail (DateTime, MicroControllerID,PlantBatch,Temperature,Humidity,brightness) VALUES (?,?, ?,?, ?,?)', 
                [dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness]);
}

module.exports = {
    initialiseSqlite3,
    createTableIfNotExists,
    getSensorDataByMicrocontrollerId,
    getAllSensorData,
    insertSensorValues,

};
