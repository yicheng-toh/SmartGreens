`
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

`



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
  