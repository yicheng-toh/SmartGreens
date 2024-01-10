/*
This file provides routes that are related to the amoutn of aw materials on the arm.
Some example includes the amount of 
- acidic solution
- akaline solution
- n solution
- p solution
- k solution

*/
const { json } = require("express");
const express = require("express");
const router = express.Router();
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")

router.use(json());

//Router posts requests
router.post('/insertData/:microcontrollerId', async (req, res) => {
    try{     
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

//Todo: this route is not completed yet.
router.post('/insertNewInventory', async (req, res) => {
    try{     
        try {
        const {plantName, sensorRanges, plantPicture, daysToMature} = res.body;
        //await mysqlLogic.insertSensorValues(dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness);
        res.status(201).send('Data inserted successfully');
        } catch (error) {
        console.error('Error inserting data:', error);
        sendInternalServerError(res);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});


//Todo: this route is not completed yet.
router.post('/updateInventory', async (req, res) => {
    try{     
        try {
        const {currentInvenotryName, quantityChange} = res.body;
        //need to check for 
        //await mysqlLogic.insertSensorValues(dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness);
        res.status(201).send('Data inserted successfully');
        } catch (error) {
        console.error('Error inserting data:', error);
        sendInternalServerError(res);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});


//Router get request.
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

//Todo: This route is not completed yet.
router.get('/getInventory', async(req, res) => {
    try {
    //   const [rows] = await mysqlLogic.getAllSensorData();
    //   res.json(rows);
    const i = 1;
    } catch (error) {
      console.error('Error retrieving data:', error);
      sendInternalServerError(res);
    }
});
 