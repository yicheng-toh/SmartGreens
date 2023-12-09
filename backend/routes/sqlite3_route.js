const { json } = require("express");
const express = require("express");f
const {sendBadRequestResponse, sendInternalServerError} = require("./request_error_messages")
const sqlite3 = require('sqlite3')
const router = express.Router();

router.use(json());


// Inserts data into sqlite database.
// This is determined by the microcontroller id
// Users are to provide temperature, humidty, brightness from the microcontroller.
router.post('/insertData/:microcontrollerId', (req, res) => {
  try{
  const currentDateTime = new Date();
  const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
  const dateTime = formattedDateTime.toString();
  console.log('dateTime is' + dateTime);
  const { temperature, humidity, brightness } = req.body;
  const { microcontrollerId } = req.params;
  } catch (error){
    sendBadRequestResponse(res);
  }

  let plantBatch = 0;
  try{
    db.run('INSERT INTO SensorDetail (DateTime, MicroControllerID,PlantBatch,Temperature,Humidity,brightness) VALUES (?,?, ?,?, ?,?)', 
                [dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness], (err) => {
      if (err) {
        console.error('Error inserting data:', err);
        sendInternalServerError(res);
      } else {
        res.status(201).send('Data inserted successfully' + dateTime);
      }
    });
  } catch (error) {
    sendInternalServerError(res);
  }
});

// Retrieves data from the database based on microcontroller
router.get('/retrieveData/:microcontroller', (req, res) => {
  try{
  const {microcontroller} = req.params;

  db.all('SELECT * FROM SensorDetail WHERE microcontrollerId = ?', (microcontroller), (err, rows) => {
    if (err) {
      console.error('Error retrieving data:', err);
      sendInternalServerError(res);
    } else {
      res.json(rows);
    }
    
  });
  } catch (error) {
    sendInternalServerError(res);
  }
});

// Retrieves all the data from the sqlite database
router.get('/retrieveData', (req, res) => {
  try{
    db.all('SELECT * FROM SensorDetail', (err, rows) => {
      if (err) {
        console.error('Error retrieving data:', err);
        sendInternalServerError(res);
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    sendInternalServerError(res);
  }
  });

function intialiseSqlite3(){
     // Initialize the SQLite database connection
     // TODO : to ensure that all the errors are caught.
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

