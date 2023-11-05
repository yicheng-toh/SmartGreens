// Coming soon....

const { json } = require("express");
const express = require("express");
// const sqlite3 = require('sqlite3')
// const {dbConnection} = require("./database.js")
// const dbConnection = require("../main.js")
const {dbConnection} = require("../database.js");
const mysql = require('mysql2/promise');
const router = express.Router();

router.use(json());


//sample code from chatgpt
  // Endpoint to insert data (POST request)
  router.post('/insertData/:microcontrollerId', async (req, res) => {
    // console.log(req);
    console.log(req.body);

    const { dateTime, temperature, humidity, brightness } = req.body;
    const { microcontrollerId } = req.params;
    
    //plant batch is to be queried from the table...maybe need datetime, plantbatch microcontroller.
    let plantBatch = 1;
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
  // });
  
  // Endpoint to retrieve data (POST request)
  router.get('/retrieveData', async(req, res) => {
    // console.log(dbConnection);
    try {
      // const [rows] = await dbConnection.execute('SELECT * FROM SensorDetail');
      
      // const [rows, fields] = await dbConnection.execute('SELECT * FROM SensorDetail');
      const [rows] = await dbConnection.promise().query('SELECT * FROM SensorDetail');
      console.log(rows);
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
        const [rows] = await dbConnection.promise().query('SELECT * FROM SensorDetail WHERE plantBatch = ?', (plantBatch));
        console.log(rows);
        // const rows = await dbConnection.execute('SELECT * FROM SensorDetail');
        
        res.json(rows);
      } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send('Internal Server Error');
      }
      });
  // });

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


module.exports = router;

