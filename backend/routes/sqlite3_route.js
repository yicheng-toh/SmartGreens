const { json } = require("express");
const express = require("express");
const sqlite3 = require('sqlite3')
const router = express.Router();

router.use(json());


// Inserts data into sqlite database.
// This is determined by the microcontroller id
// Users are to provide temperature, humidty, brightness from the microcontroller.
router.post('/insertData/:microcontrollerId', (req, res) => {
  const currentDateTime = new Date();
  const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
  const dateTime = formattedDateTime.toString();
  console.log('dateTime is' + dateTime);
  const { temperature, humidity, brightness } = req.body;
  const { microcontrollerId } = req.params;

  let plantBatch = 0;

  db.run('INSERT INTO SensorDetail (DateTime, MicroControllerID,PlantBatch,Temperature,Humidity,brightness) VALUES (?,?, ?,?, ?,?)', 
              [dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness], (err) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(201).send('Data inserted successfully' + dateTime);
    }
  });
});

// Retrieves data from the database based on microcontroller
router.get('/retrieveData/:microcontroller', (req, res) => {

  const {microcontroller} = req.params;

  db.all('SELECT * FROM SensorDetail WHERE microcontrollerId = ?', (microcontroller), (err, rows) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(rows);
    }
  });
});

// Retrieves all the data from the sqlite database
router.get('/retrieveData', (req, res) => {
    db.all('SELECT * FROM SensorDetail', (err, rows) => {
      if (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(rows);
      }
    });
  });

function intialiseSqlite3(){
     // Initialize the SQLite database connection
     const db = new sqlite3.Database('mydatabase.db', sqlite3.OPEN_READWRITE,(err) => {
        if (err) {
          console.error('Error connecting to the SQLite database:', err);
        } else {
          console.log('Connected to the SQLite database');
        }
      });
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


module.exports = [router,intialiseSqlite3];

