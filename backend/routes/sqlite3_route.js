const { json } = require("express");
const express = require("express");
const sqlite3 = require('sqlite3')
const db = require("./../main");

const router = express.Router();

router.use(json());

router.get("/getAllData", (req, res) => {
  console.log("sending mockBarData");
  // // console.log(mockBarData);
  // console.log("eh>");
//   res.status(200).send(JSON.stringify(mockBarData));
  res.status(200);
});


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
    dbName = "mydatabase.db";
     // Initialize the SQLite database connection
  const db = new sqlite3.Database(dbName, (err) => {
    if (err) {
      console.error('Error connecting to the SQLite database:', err);
    } else {
      console.log('Connected to the SQLite database');
    }
  });


  

  // You can perform additional setup or operations on the database here if needed.

  // Return the database connection
//   return db;
// conn = sqlite3.connect('mydatabase.db')
// return conn;
}


module.exports = [router,intialiseSqlite3];

