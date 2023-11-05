const { json } = require("express");
const express = require("express");
const sqlite3 = require('sqlite3')
const router = express.Router();

router.use(json());


//sample code from chatgpt
  // Endpoint to insert data (POST request)
  router.post('/insertData/:microcontrollerId', (req, res) => {
    const { dateTime, temperature, humidity, brightness } = req.body;
    const { microcontrollerId } = req.params;
    //plant batch is to be queried from the table...maybe need datetime, plantbatch microcontroller.
    let plantBatch = 0;
  
    db.run('INSERT INTO SensorDetail (DateTime, MicroControllerID,PlantBatch,Temperature,Humidity,brightness) VALUES (?,?, ?,?, ?,?)', 
                [dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness], (err) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(201).send('Data inserted successfully');
      }
    });
  });
  
  // Endpoint to retrieve data (POST request)
  router.get('/retrieveData/:plantBatch', (req, res) => {

    //get the plant batch from the params
    const {plantBatch} = req.params;
    //get the sql entries when sql is that 

    db.all('SELECT * FROM SensorDetail WHERE plantBatch = ?', (plantBatch), (err, rows) => {
      if (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(rows);
      }
    });
  });

    // Endpoint to retrieve data (POST request)
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
    return db;
}


module.exports = [router,intialiseSqlite3];

