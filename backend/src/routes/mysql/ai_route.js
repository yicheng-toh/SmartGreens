// const axios = require('axios');
const { json } = require("express");
const express = require("express");
const fetch = require('node-fetch');
const fs = require('fs').promises;
const router = express.Router({ mergeParams: true });
const {
  sendBadRequestResponse,
  sendInternalServerError,
} = require("../request_error_messages.js");
const mysqlLogic = require("../../database_logic/sql/sql.js");
const {
  convertTime12HourTo24Hour,
  formatDateTimeOutput,
} = require("../../misc_function.js");

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI related operations
 */


//will need to put this in the env variable...
let aiAddress = "http:///127.0.0.1:5000/ai_routes";

/**
 * @swagger
 * /ai/predictFromPhoto/{microcontrollerId}:
 *   post:
 *     summary: This is still a dummy route! do not use it yet.
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: microcontrollerId
 *         required: true
 *         description: String ID of the Microcontroller to delete
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imgData:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/predictFromPhoto/:microcontrollerId", async (req, res) => {
  try{
    let success = 0;
    let {microcontrollerId} = req.params;
    console.log("microcontroller id is", microcontrollerId);
    // let {imgData} = req.body;

    microcontrollerId = microcontrollerId.replace(/%20/g, ' ');

    //send the data over to python
    //mock a data by reading in the image.
    // Read file as a Buffer
    let tempFilePath = "../example1.jpg";
    let imgData;
    await fs.readFile(tempFilePath, { encoding: 'base64' })
    .then(data => {
      imgData = data;
    })
    .catch(err => {
      console.error('Error reading file:', err);
    });
    console.log("img data outside the scope", imgData);


    
    let response = null;
    const postDataToServer = async () => {
      const dataToSend = {
        // "imgData": imgDataBase64,
        "imgData": imgData,
        "microcontrollerId": microcontrollerId
        };
    
      try {
        response = await fetch(aiAddress, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });
        console.log("fetch response is", response);
    
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response;
      } catch (error) {
        console.error('There was a problem with the request:', error);
      }
    };
    let plantBatchId = await mysqlLogic.getPlantBatchIdGivenMicrocontrollerPrefix(
      microcontrollerId
    );
    console.log("plantBatchId", plantBatchId);
    // Call the function to send the POST request
    response = await postDataToServer();
    
    //store data in the plant batch, which are the LatestImage, expected yield
    //save it into another file also!!!
    let aiOutput = await response.json();
    console.log("ai output is:", aiOutput);
    let expectedCurrentYield = await aiOutput.expectedCurrentYield;
    let latestImage = await aiOutput.imgData;
    let bufferData;
    if (latestImage) {
        // Convert base64 to buffer
        bufferData = Buffer.from(latestImage, 'base64');
        // Write buffer data to file
        fs.writeFile('image.jpg', bufferData, { encoding: 'binary' })
            .then(() => {
                console.log('Image file written successfully.');
            })
            .catch(error => {
                console.error('Error writing image file:', error);
            });
    } else {
        console.error('Latest image data is undefined.');
    }
    //get the data by joining 2 tables. and then update it.
    console.log("Expected current yield is ", expectedCurrentYield);
    console.log("Latest image is ", latestImage);
    console.log("Microcontrollr id is ", microcontrollerId);
    //write all the data into the database
    success = mysqlLogic.insertLatestImagesAndExpectedCurrentYieldIntoPlantbatch(plantBatchId,expectedCurrentYield, bufferData);
    console.log("storage is successful");
    res.status(201).json({ success: success, message: "AI training complete and result stored." });
    return;
  }catch(error){
    console.log("Error encountered", error);
    sendInternalServerError(res, error);
    return;
  }});
  


  module.exports = router;
