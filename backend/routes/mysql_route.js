const { json } = require("express");
const express = require("express");
const {dbConnection} = require("../database.js");
const mysql = require('mysql2/promise');
const router = express.Router();

router.use(json());

const PLANTBATCH = 1

// Inserts data into sqlite database.
// This is determined by the microcontroller id
// Users are to provide temperature, humidty, brightness from the microcontroller.
router.post('/insertData/:microcontrollerId', async (req, res) => {
  // console.log(req);
  const currentDateTime = new Date();
  const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
  const dateTime = formattedDateTime.toString();

  const { temperature, humidity, brightness } = req.body;
  const { microcontrollerId } = req.params;
  //TODO: Query the plant batch from the table.
  //plant batch is to be queried from the table...maybe need datetime, plantbatch microcontroller.
  let plantBatch = PLANTBATCH;
  console.log(dateTime, temperature, humidity, brightness, microcontrollerId, plantBatch);
  try {
    await dbConnection.execute('INSERT INTO SensorDetail (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (?, ?, ?, ?, ?, ?)',
      [dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness]);
    res.status(201).send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal Server Error');
  }
  });


// Retrieves data from the database based on microcontroller
router.get('/retrieveData', async(req, res) => {
  // console.log(dbConnection);
  try {
    // const [rows] = await dbConnection.execute('SELECT * FROM SensorDetail');
    
    // const [rows, fields] = await dbConnection.execute('SELECT * FROM SensorDetail');
    const [rows] = await dbConnection.promise().query('SELECT * FROM SensorDetail');
    // console.log(rows);
    // const rows = await dbConnection.execute('SELECT * FROM SensorDetail');
    
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
  });


router.get('/retrieveData/:plantBatch', async(req, res) => {
  // console.log(dbConnection);
  try {
    // const [rows] = await dbConnection.execute('SELECT * FROM SensorDetail');
    const {plantBatch} = req.params;
    // const [rows, fields] = await dbConnection.execute('SELECT * FROM SensorDetail');
    // const [rows] = await dbConnection.promise().query('SELECT * FROM SensorDetail WHERE plantBatch = ?', (plantBatch));
    const [rows] = await dbConnection.promise().query('SELECT * FROM SensorDetail WHERE microcontrollerId = ?', (plantBatch));
    // console.log(rows);
    // const rows = await dbConnection.execute('SELECT * FROM SensorDetail');
    
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
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
  const currentDateTime = new Date();
  const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
  const dateTime = formattedDateTime.toString();
  console.log("");
  console.log("Data has successfully been received.");

  const { temperature, humidity, brightness } = req.body;
  const microcontrollerId = DEMO_MICROCONTROLLER_ID
  
  //TODO query plantbatch from the sql table.
  let plantBatch = PLANTBATCH;
  try {
    await dbConnection.execute('INSERT INTO SensorDetail (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (?, ?, ?, ?, ?, ?)',
      [dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness]);
    res.status(201).send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal Server Error');
  }
  });



router.get('/retrieveData/:plantBatch', async(req, res) => {
  try {
    const {plantBatch} = req.params;
    const [rows] = await dbConnection.promise().query('SELECT * FROM SensorDetail WHERE microcontrollerId = ?', (plantBatch));
    
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
  });

module.exports = router;

