const { json } = require("express");
const express = require("express");
// const mysqlLogic = require("../database_logic/mysql.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")
const mysql = require('mysql2/promise');
const router = express.Router();
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")

router.use(json());

const PLANTBATCH = 1
console.log(`mysqllogic is ${JSON.stringify(mysqlLogic, null, 2)}`);

// Inserts data into sqlite database.
// This is determined by the microcontroller id
// Users are to provide temperature, humidty, brightness from the microcontroller.
router.post('/insertData/:microcontrollerId', async (req, res) => {
  try{
  const currentDateTime = new Date();
  const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
  const dateTime = formattedDateTime.toString();

  const { temperature, humidity, brightness } = req.body;
  const { microcontrollerId } = req.params;
  //TODO: Query the plant batch from the table.
  //plant batch is to be queried from the table...maybe need datetime, plantbatch microcontroller.
    let plantBatch = PLANTBATCH;
    
    try {
      await mysqlLogic.insertSensorValues(dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness);
      res.status(201).send('Data inserted successfully');
    } catch (error) {
      console.error('Error inserting data:', error);
      sendInternalServerError(res);
    }
  } catch (error) {
    sendBadRequestResponse(res);
  }
  
  });


// Retrieves data from the database based on microcontroller
router.get('/retrieveData', async(req, res) => {
  try {
    const [rows] = await mysqlLogic.getAllSensorData();
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving data:', error);
    sendInternalServerError(res);
  }
  });


router.get('/retrieveData/:microcontrollerId', async(req, res) => {
  try {
    const {microcontrollerId} = req.params;
    const [rows] = await mysqlLogic.getSensorDataByMicrocontrollerId(microcontrollerId);    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error retrieving data:', error);
    sendInternalServerError(res);
  }
  });


// function initialiseMySQL(){
//      // Initialize the SQLite database connection
//      const db = new sqlite3.Database('mydatabase.db', sqlite3.OPEN_READWRITE,(err) => {
//         if (err) {
//           console.error('Error connecting to the SQLite database:', err);
//         } else {
//           console.log('Connected to the SQLite database');
//         }
//       });
//     console.log("Initialising table");
//     db.run(`
//         CREATE TABLE IF NOT EXISTS SensorDetail (
//         dateTime DATETIME,
//         microcontrollerId INT,
//         plantBatch INT,
//         temperature FLOAT,
//         humidity INT,
//         brightness INT
//         )
//         `);
//     return db;
// }

//////////////////////////////////////
//for demo!!
const DEMO_MICROCONTROLLER_ID = 91124
const PLANT_BATCH_DEMO = 1

router.post('/', async (req, res) => {
  try{
  const currentDateTime = new Date();
  const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
  const dateTime = formattedDateTime.toString();
  console.log("");
  console.log("Data has successfully been received.");

  const { temperature, humidity, brightness } = req.body;
  const microcontrollerId = DEMO_MICROCONTROLLER_ID
  //TODO query plantbatch from the sql table.
  //TODO to make this look better.!!!
    let plantBatch = PLANTBATCH;
    try {
      await mysqlLogic.insertSensorValues(dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness);
      res.status(201).send('Data inserted successfully');
    } catch (error) {
      console.error('Error inserting data:', error);
      sendInternalServerError(res);
    }
  } catch (error) {
    sendBadRequestResponse(res);
  }
  
  });



router.get('/retrieveData/:microcontrollerId', async(req, res) => {
  try {
    const {microcontrollerId} = req.params;
    const [rows] = await mysqlLogic.getSensorDataByMicrocontrollerId(microcontrollerId);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error retrieving data:', error);
    sendInternalServerError(res);
  }
  });

module.exports = router;
