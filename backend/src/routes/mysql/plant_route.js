const { json } = require("express");
const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  sendBadRequestResponse,
  sendInternalServerError,
} = require("../request_error_messages.js");
const mysqlLogic = require("../../database_logic/sql/sql.js");
/**
 * @swagger
 * tags:
 *   name: Plant
 *   description: Routes for plant-related data
 */

router.use(json());

/**
 * @swagger
 * /plant/insertData/{microcontrollerId}:
 *   post:
 *     summary: Insert sensor data for a plant
 *     tags: [Plant]
 *     parameters:
 *       - in: path
 *         name: microcontrollerId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               temperature:
 *                 type: number
 *                 example: 25.5
 *               humidity:
 *                 type: number
 *                 example: 60
 *               brightness:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *     examples:
 *       "application/json":
 *         success: true
 */

//Router posts requests
router.post("/insertData/:microcontrollerId", async (req, res) => {
  try {
    try {
      //There are 2 types of microcontroller. letter + 1/2.
      //detect the microncroller number and then see what values they offer.
      //Afterwards, check if the corresponding microcontroller have sent a reading prior.
      //if yes and the entries to be updated is still null, update it, else creaste a new entry
      const { microcontrollerId } = req.params;
      if (microcontrollerId === undefined || microcontrollerId.length < 2 || microcontrollerId.length > 20) {
        sendBadRequestResponse(res);
        return;
      }
      let success = 0;
      let pH = null;
      let tds = null;
      let ec = null;
      let co2 = null;
      let temperature = null;
      let humidity = null;
      let brightness = null;
      let plantBatchId = -1;
      let partnerMicrocontrollerId = null;
      // const plantBatchId = -1;
      const currentDateTime = new Date();
      const formattedDateTime = currentDateTime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const dateTime = formattedDateTime.toString();
      const microcontrollerIdPrefix = microcontrollerId.slice(0, -1);
      const microcontrollerIdSuffix = microcontrollerId.slice(-1);
      plantBatchId =
        await mysqlLogic.getPlantBatchIdGivenMicrocontrollerPrefix(
          microcontrollerIdPrefix
        );
      if (microcontrollerIdSuffix == 1) {
        ({ temperature, humidity, brightness } = req.body);
        if (temperature === undefined || isNaN(parseFloat(temperature))) {
          // console.log("fail at temperature");
          sendInternalServerError(res);
          return;
        } else if (brightness === undefined || isNaN(parseFloat(brightness))) {
          // console.log("fail at brightness");
          sendInternalServerError(res);
          return;
        } else if (humidity === undefined || isNaN(parseFloat(humidity))) {
          // console.log("fail at humidity");
          sendInternalServerError(res);
          return;
        }
        partnerMicrocontrollerId = microcontrollerIdPrefix + "2";
        console.log(temperature, humidity, brightness);
        success = await mysqlLogic.insertSensorValuesSuffix1(
          dateTime,
          microcontrollerIdPrefix,
          microcontrollerIdSuffix,
          plantBatchId,
          temperature,
          humidity,
          brightness
        );
      } else if (microcontrollerIdSuffix == 2) {
        ({ pH, tds, ec, co2 } = req.body);
        if (pH === undefined || isNaN(parseFloat(pH))) {
          // console.log("fail at temperature");
          sendInternalServerError(res);
          return;
        } else if (tds === undefined || isNaN(parseFloat(tds))) {
          // console.log("fail at brightness");
          sendInternalServerError(res);
          return;
        } else if (ec === undefined || isNaN(parseFloat(ec))) {
          // console.log("fail at humidity");
          sendInternalServerError(res);
          return;
        } else if (co2 === undefined || isNaN(parseFloat(co2))) {
          // console.log("fail at humidity");
          sendInternalServerError(res);
          return;
        }
        partnerMicrocontrollerId = microcontrollerIdPrefix + "1";
        console.log(pH, co2, ec, tds);
        success = await mysqlLogic.insertSensorValuesSuffix2(
          dateTime,
          microcontrollerIdPrefix,
          microcontrollerIdSuffix,
          plantBatchId,
          pH, co2, ec, tds
        );
      } else {
        sendBadRequestResponse(res);
        return;
      }
      console.log(dateTime, microcontrollerId);
      res
        .status(201)
        .json({ success: success, message: "Data inserted successfully" });
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res);
    }
  } catch (error) {
    sendBadRequestResponse(res);
  }
});

/**
 * @swagger
 * /plant/createPlant:
 *   post:
 *     summary: Create a new plant species
 *     tags: [Plant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantName:
 *                 type: string
 *                 example: "Tomato"
 *               sensorRanges:
 *                 type: integer
 *                 example: 100
 *               daysToMature:
 *                 type: integer
 *                 example: 90
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *     examples:
 *       "application/json":
 *         success: true
 */
router.post("/createPlant", async (req, res) => {
  try {
    try {
      let { plantName, sensorRanges, daysToMature } = req.body;
      if (plantName === undefined || !plantName.trim()) {
        sendInternalServerError(res);
        return;
      } else if (sensorRanges === undefined || isNaN(parseInt(sensorRanges))) {
        sendInternalServerError(res);
        return;
      } else if (daysToMature === undefined || isNaN(parseInt(daysToMature))) {
        sendInternalServerError(res);
        return;
      }
      plantName = plantName.trim();
      sensorRanges = parseInt(sensorRanges);
      daysToMature = parseInt(daysToMature);
      const success = await mysqlLogic.insertNewPlant(
        plantName,
        sensorRanges,
        daysToMature
      );
      if (success) {
        res
          .status(201)
          .json({ success: success, message: "Data inserted successfully" });
      } else {
        sendInternalServerError(res);
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res);
    }
  } catch (error) {
    sendBadRequestResponse(res);
  }
});

/**
 * @swagger
 * /plant/editSeedQuantity:
 *   post:
 *     summary: Update seed quantity for a plant
 *     tags: [Plant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantId:
 *                 type: integer
 *                 example: 1
 *               quantityChange:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Data updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *     examples:
 *       "application/json":
 *         success: true
 */
router.post("/editSeedQuantity", async (req, res) => {
  try {
    try {
      let { plantId, quantityChange } = req.body;
      if (plantId === undefined || isNaN(parseInt(plantId))) {
        sendInternalServerError(res);
        return;
      } else if (
        quantityChange === undefined ||
        isNaN(parseInt(quantityChange))
      ) {
        sendInternalServerError(res);
        return;
      }
      plantId = parseInt(plantId);
      quantityChange = parseInt(quantityChange);
      const success = await mysqlLogic.updatePlantSeedInventory(
        plantId,
        quantityChange
      );
      if (success) {
        res
          .status(201)
          .json({ success: success, message: "Data inserted successfully" });
      } else {
        sendInternalServerError(res);
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res);
    }
  } catch (error) {
    sendBadRequestResponse(res);
  }
});

/**
 * @swagger
 * /plant/growPlant:
 *   post:
 *     summary: Grow a plant from seeds
 *     tags: [Plant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantId:
 *                 type: integer
 *                 example: 1
 *               plantLocation:
 *                 type: integer
 *                 example: 2
 *               microcontrollerId:
 *                 type: integer
 *                 example: 3
 *               quantityPlanted:
 *                 type: integer
 *                 example: 5
 *               datePlanted:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-22"
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *     examples:
 *       "application/json":
 *         success: true
 */
//Todo: this route is not completed yet. TODO CLARIFICATION REQUIRED
//High difficulty route.
router.post("/growPlant", async (req, res) => {
  try {
    try {
      let success = 0;
      let {
        plantId,
        plantLocation,
        microcontrollerId,
        quantityPlanted,
        datePlanted,
      } = req.body;
      if (plantId === undefined || isNaN(parseInt(plantId))) {
        // console.log("fail at plantId");
        sendInternalServerError(res);
        return;
      } else if (
        plantLocation === undefined ||
        isNaN(parseInt(plantLocation))
      ) {
        // console.log('fail at plantLocation');
        sendInternalServerError(res);
        return;
      } else if (
        microcontrollerId === undefined ||
        isNaN(parseInt(microcontrollerId))
      ) {
        // console.log("fail at microcontroller");
        sendInternalServerError(res);
        return;
      } else if (
        quantityPlanted === undefined ||
        isNaN(parseInt(quantityPlanted)) ||
        parseInt(quantityPlanted) <= 0
      ) {
        // console.log("fail at quantity");
        sendInternalServerError(res);
        return;
      }

      //may need to disintegrate this logic....
      success = await mysqlLogic.growPlant(
        plantId,
        plantLocation,
        microcontrollerId,
        quantityPlanted,
        datePlanted
      );
      // console.log("success", success);
      if (success) {
        res
          .status(201)
          .json({ success: success, message: "Data inserted successfully" });
      } else {
        sendInternalServerError(res);
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res);
    }
  } catch (error) {
    sendBadRequestResponse(res);
  }
});

/**
 * @swagger
 * /plant/harvestPlant:
 *   post:
 *     summary: Harvest a plant
 *     tags: [Plant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantBatchId:
 *                 type: integer
 *                 example: 1
 *               quantityHarvested:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Data harvested successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *     examples:
 *       "application/json":
 *         success: true
 */
//may require break down of sql statements here.
router.post("/harvestPlant", async (req, res) => {
  try {
    let success = 0;
    let { plantBatchId, quantityHarvested } = req.body;
    if (plantBatchId === undefined || isNaN(parseInt(plantBatchId))) {
      sendInternalServerError(res);
      return;
    } else if (
      quantityHarvested === undefined ||
      isNaN(parseInt(quantityHarvested))
    ) {
      sendInternalServerError(res);
      return;
    }
    plantBatchId = parseInt(plantBatchId);
    quantityHarvested = parseInt(quantityHarvested);
    success = await mysqlLogic.harvestPlant(plantBatchId, quantityHarvested);
    if (success) {
      res
        .status(201)
        .json({ success: success, message: "Data inserted successfully" });
    } else {
      sendInternalServerError(res);
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res);
  }
});

/**
 * @swagger
 * /plant/retrieveData:
 *   get:
 *     summary: Retrieve sensor data for all plants
 *     tags: [Plant]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 *     examples:
 *       "application/json":
 *         success: true
 */
//Router get request.
// Retrieves data from the database based on microcontroller
router.get("/retrieveData", async (req, res) => {
  try {
    // const [rows] = await mysqlLogic.getAllSensorData();
    // const [rows]  = await mysqlLogic.getAllSensorData();
    const rows = await mysqlLogic.getAllSensorData();
    if (rows) {
      res.status(200).json({ success: 1, result: rows });
    } else {
      res.json({ success: 1, message: "No sensor data available" });
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res);
  }
});

/**
 * @swagger
 * /plant/plantSeedsInventory:
 *   get:
 *     summary: Retrieve plant seeds inventory
 *     tags: [Plant]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 *     examples:
 *       "application/json":
 *         success: true
 */
router.get("/plantSeedsInventory", async (req, res) => {
  try {
    const [rows] = await mysqlLogic.getAllPlantSeedInventory();
    res.status(200).json({ success: 1, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res);
  }
});

/**
 * @swagger
 * /plant/plantData:
 *   get:
 *     summary: Retrieve information about all plants
 *     tags: [Plant]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 *     examples:
 *       "application/json":
 *         success: true
 */
router.get("/plantData", async (req, res) => {
  try {
    let success = 0;
    const [rows] = await mysqlLogic.getAllPlantInfo();
    success = 1;
    res.status(200).json({ success: success, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res);
  }
});

/**
 * @swagger
 * /plantYield:
 *   get:
 *     summary: Get plant yield rate data.
 *     description: Retrieve plant yield rate data.
 *     responses:
 *       200:
 *         description: Successful response with plant yield rate data.
 *         content:
 *           application/json:
 *             example:
 *               success: 1
 *               result:
 *                 - plantId: 1
 *                   yieldRate: 0.85
 *                 - plantId: 2
 *                   yieldRate: 0.92
 *       500:
 *         description: Internal Server Error.
 */
router.get("/plantYield", async (req, res) => {
  try {
    let success = 0;
    // console.log(mysqlLogic.getAllPlantYieldRate);
    const [rows] = await mysqlLogic.getAllPlantYieldRate();
    console.log(rows);
    success = 1;
    res.status(200).json({ success: success, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res);
  }
});

router.get("/plantBatchInfoAndYield", async (req, res) => {
  try {
    let success = 0;
    const [rows] = await mysqlLogic.getAllPlantBatchInfoAndYield();
    console.log(rows);
    success = 1;
    res.status(200).json({ success: success, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res);
  }
});

//Todo: This route is not completed yet. (repetition)
// router.get('/plantSensorReading', async(req, res) => {
//     try {
//       const result = await mysqlLogic.getAllSensorData();
//       res.status(200).json({result: result});
//     const i = 1;
//     } catch (error) {
//       console.log('Error retrieving data:', error);
//       sendInternalServerError(res);
//     }
// });

//cannot calculate the yield...
module.exports = router;
