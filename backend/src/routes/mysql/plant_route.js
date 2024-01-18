/*
This file contains the routes for plant related data.

Post
- New plant species and the relevant reading
- update the purchase for the number of seeds/seedlings.
- From there then can post the number of seeds toi plant. batch number will be allocated. 
with the microcontrller id involved. 
- And the number of harvest.

Get 
-percentage yield of the plant


Story:
1. Farmer purchase the seeds to stock up the inventory.
(post request 2)
2. If the seed of the plant does not exisit, farmer is to create a new plant details
This details includes the optimal range of sensors for the platns.
(post request 1)
3. If the farmer want to use the seed to plant. He can click on plant on the plants with x number of seeds.
Should there be a default no.? idk.
He is to key in the location of the plant as well as the microcontroller that is assigned to it.
(post request 3)

The number of seeds will reduced accordingly.
(should the farmer be able to revert(undo) or discard all the seed in the batch?)
(post request 4)


-----
story.
1. farmers want to see how many quantity for each of the seeds available
(get request 1, query all available seed where the qty is not 0)
2. farmers want to see the optimal range for each of the plant.
(get request 2, query all the available plant that is entered into the system.)
(searches and all that are not mandatory now.)
3. growing batch details????  -> one dashboard for each plant. does not really make sense tho....
(sensor readings for the plant.)

*/



const { json } = require("express");
const express = require("express");
const router = express.Router({mergeParams: true});
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")

router.use(json());

//Router posts requests
router.post('/insertData/:microcontrollerId', async (req, res) => {
    try{     
      try {
        let temperature = null;
        let brightness = null;
        let humidity = null;
        let pH = null;
        let tds = null;
        let ec = null;
        let co2 = null;
        const plantBatch = 1;
        const {microcontrollerId} = req.params;
        const currentDateTime = new Date();
        const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
        const dateTime = formattedDateTime.toString();
        console.log("Data has successfully been received.");

        ({ temperature, humidity, brightness } = req.body);
        console.log(temperature, humidity, brightness);
        console.log(dateTime, microcontrollerId, plantBatch);
        // console.log(dateTime, microcontrollerId, plantBatch);
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

router.post('/createPlant', async (req, res) => {
    try{     
        try {
          const {plantName, sensorRanges, daysToMature} = res.body;
          if(plantName === undefined){
            sendInternalServerError(res);
          }else if(sensorRanges === undefined){
            sendInternalServerError(res);
          }else if(daysToMature === undefined || isNaN(parseInt(daysToMature))){
            sendInternalServerError(res);
          }
          const success = await mysqlLogic.insertNewPlant(plantName,sensorRanges,daysToMature);
          if(success){
            res.status(201).send('Data inserted successfully');
          }else{
            sendInternalServerError(res);
          }
        } catch (error) {
        console.error('Error inserting data:', error);
        sendInternalServerError(res);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});

router.post('/editSeedQuantity', async (req, res) => {
    try{     
        try {
          const {plantId, quantityChange} = res.body;
          if(plantId === undefined){
            sendInternalServerError(res);
          }else if(quantityChange === undefined){
            sendInternalServerError(res);
          }
          const success = await mysqlLogic.updatePlantSeedInventory(plantId, quantityChange);
          if(success){
            res.status(201).send('Data inserted successfully');
          }else{
            sendInternalServerError(res);
          }
        } catch (error) {
          console.error('Error inserting data:', error);
          sendInternalServerError(res);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});

//Todo: this route is not completed yet. TODO CLARIFICATION REQUIRED
//High difficulty route.
router.post('/growPlant', async (req, res) => {
    try{     
        try {
          const {plantName, plantLocation, microcontrollerId, quantityPlanted} = res.body;

          //may need to disintegrate this logic....
          const success = mysqlLogic.growPlants(plantName, plantLocation, microcontrollerId, quantityPlanted);
          if(success){
            res.status(201).send('Data inserted successfully');
          }else{
            sendInternalServerError(res);
          }
        } catch (error) {
        console.error('Error inserting data:', error);
        sendInternalServerError(res);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});

//may require break down of sql statements here.
router.post('/harvestPlant', async(req, res) => {
  try {
      let success = 0;
      const {plantBatch,quantityHarvested} = req.body;
      success = await mysqlLogic.harvestPlant(plantBatch, quantityHarvested);
      if (success) {
        res.status(200).json({"success": success});
      } else {
        sendInternalServerError(res);
      }
  } catch (error) {
      console.error('Error retrieving data:', error);
      sendInternalServerError(res);
  }
});

//Router get request.
  // Retrieves data from the database based on microcontroller
router.get('/retrieveData', async(req, res) => {
    try {
        // const [rows] = await mysqlLogic.getAllSensorData();
        // const [rows]  = await mysqlLogic.getAllSensorData();
        const rows = await mysqlLogic.getAllSensorData();
        if (rows) {
          res.status(200).json(rows);
        } else {
          res.json({ message: 'No sensor data available' });
        }
    } catch (error) {
        console.error('Error retrieving data:', error);
        sendInternalServerError(res);
    }
});

router.get('/plantSeedsInventory', async(req, res) => {
    try {
      const [rows] = await mysqlLogic.getAllPlantSeedInventory();
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error retrieving data:', error);
      sendInternalServerError(res);
    }
});
  

router.get('/plantData', async(req, res) => {
    try {
      const [rows] = await mysqlLogic.getAllPlantInfo();
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error retrieving data:', error);
      sendInternalServerError(res);
    }
});

//Todo: This route is not completed yet. 
// router.get('/plantSensorReading', async(req, res) => {
//     try {
//       const result = await mysqlLogic.getAllSensorData();
//       res.status(200).json(result);
//     const i = 1;
//     } catch (error) {
//       console.error('Error retrieving data:', error);
//       sendInternalServerError(res);
//     }
// });

//cannot calculate the yield...
module.exports = router;