const { json } = require("express");
const express = require("express");
const {sendBadRequestResponse, sendInternalServerError} = require("./request_error_messages")
const router = express.Router();
const sqlite = require("../database_logic/sqlite/sqlite")

router.use(json());

const db = sqlite.initialiseSqlite3();
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
    sqlite.insertSensorValues(dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness, db);
    res.status(201).send('Data inserted successfully' + dateTime);
  } catch (error) {
    sendInternalServerError(res);
  }
});

// Retrieves data from the database based on microcontroller
router.get('/retrieveData/:microcontroller',async (req, res) => {
  try{

    const {microcontroller} = req.params;
    const sensorData = await sqlite.getSensorDataByMicrocontrollerId(microcontroller, db);
    res.status(200).json(sensorData);  

  } catch (error) {
    console.log(error);
    sendInternalServerError(res);
  }
});

router.get('/retrieveData',async (req, res) => {
  try{

    const {microcontroller} = req.params;
    const sensorData = await sqlite.getAllSensorData(db);
    res.status(200).json(sensorData);  

  } catch (error) {
    console.log(error);
    sendInternalServerError(res);
  }
});



module.exports = {
  SQlite3Route: router, 
  db, 
  initialiseSqlite3: sqlite.createTableIfNotExists,
};

