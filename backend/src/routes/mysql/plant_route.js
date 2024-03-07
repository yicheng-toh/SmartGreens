const { json } = require("express");
const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  sendBadRequestResponse,
  sendInternalServerError,
} = require("../request_error_messages.js");
const mysqlLogic = require("../../database_logic/sql/sql.js");
const { groupSensorDataByPlantType, appendStatusToLatestSensorReadings } = require("../../misc_function.js");
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
 *           type: string
 *           example: A1
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
      if (
        microcontrollerId === undefined ||
        microcontrollerId.length < 2 ||
        microcontrollerId.length > 20
      ) {
        sendBadRequestResponse(res, "Invalid microcontroller Id.");
        return;
      }
      let success = 0;
      let pH = null;
      let TDS = null;
      let EC = null;
      let CO2 = null;
      let temperature = null;
      let humidity = null;
      let brightness = null;
      // let plantBatchId = -1;
      let plantBatchId = 1;
      let partnerMicrocontrollerId = null;
      // const plantBatchId = -1;
      const currentDateTime = new Date();
      // console.log(currentUTCDateTime);
      currentDateTime.setHours(currentDateTime.getHours() + 8); //GMT + 8
      console.log(currentDateTime);
      const formattedDateTime = currentDateTime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      console.log(formattedDateTime);
      const dateTime = formattedDateTime.toString();
      const microcontrollerIdPrefix = microcontrollerId.slice(0, -1);
      const microcontrollerIdSuffix = microcontrollerId.slice(-1);
      plantBatchId = await mysqlLogic.getPlantBatchIdGivenMicrocontrollerPrefix(
        microcontrollerIdPrefix
      );
      console.log("plantBatchId", plantBatchId);
      if (microcontrollerIdSuffix == 1) {
        ({ temperature, humidity, brightness } = req.body);
        if (temperature === undefined || isNaN(parseFloat(temperature))) {
          // console.log("fail at temperature");
          // sendInternalServerError(res, "Invalid Temperature Reading.");
          // return;
          temperature = null;
        } else if (brightness === undefined || isNaN(parseFloat(brightness))) {
          // console.log("fail at brightness");
          // sendInternalServerError(res, "Invalid Brightness Reading.");
          // return;
          brightness = null;
        } else if (humidity === undefined || isNaN(parseFloat(humidity))) {
          // console.log("fail at humidity");
          // sendInternalServerError(res, "Invalid Humidity Reading.");
          // return;
          humidity = null;
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
        ({ pH, TDS, EC, CO2 } = req.body);
        if (pH === undefined || isNaN(parseFloat(pH))) {
          // sendInternalServerError(res, "Invalid pH Reading.");
          // return;
          pH = null;
        } else if (TDS === undefined || isNaN(parseFloat(TDS))) {
          // sendInternalServerError(res, "Invalid TDS Reading.");
          // return;
          TDS = null;
        } else if (EC === undefined || isNaN(parseFloat(EC))) {
          // sendInternalServerError(res, "Invalid EC Reading.");
          // return;
          EC = null;
        } else if (CO2 === undefined || isNaN(parseFloat(CO2))) {
          // sendInternalServerError(res, "Invalid CO2 Reading.");
          // return;
          CO2 = null;
        }
        partnerMicrocontrollerId = microcontrollerIdPrefix + "1";
        console.log(pH, CO2, EC, TDS);
        success = await mysqlLogic.insertSensorValuesSuffix2(
          dateTime,
          microcontrollerIdPrefix,
          microcontrollerIdSuffix,
          plantBatchId,
          pH,
          CO2,
          EC,
          TDS
        );
      } else {
        sendBadRequestResponse(res, "Invalid Microcontroller Reading.");
        return;
      }
      console.log(dateTime, microcontrollerId);
      res
        .status(201)
        .json({ success: success, message: "Data inserted successfully" });
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res, error);
    }
  } catch (error) {
    sendBadRequestResponse(res, error);
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
        sendInternalServerError(res, "Invalid Plant Name");
        return;
      } else if (sensorRanges === undefined || isNaN(parseInt(sensorRanges))) {
        sendInternalServerError(res, "Invalid Sensor Ranges.");
        return;
      } else if (daysToMature === undefined || isNaN(parseInt(daysToMature))) {
        sendInternalServerError(res, "Invalid Days for Plants to Mature.");
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
        sendInternalServerError(
          res,
          "Error encountered when trying to insert data."
        );
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res, error);
    }
  } catch (error) {
    sendBadRequestResponse(res, error);
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
        sendInternalServerError(res, "Invalid Plant Id");
        return;
      } else if (
        quantityChange === undefined ||
        isNaN(parseInt(quantityChange))
      ) {
        sendInternalServerError(res, "Invalid Quantity Changed");
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
        sendInternalServerError(res, "Data insertion failed.");
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res, error);
    }
  } catch (error) {
    sendBadRequestResponse(res, error);
  }
});

//This function is not done yet...
/**
 * @swagger
 * /plant/updatePlantSensorInfo:
 *   post:
 *     summary: Update or insert plant sensor information
 *     tags:
 *       - Plant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantId:
 *                 type: integer
 *                 description: ID of the plant
 *                 example: 1
 *               temperature_min:
 *                 type: number
 *                 format: float
 *                 description: Minimum temperature
 *                 example: 20.5
 *               temperature_max:
 *                 type: number
 *                 format: float
 *                 description: Maximum temperature
 *                 example: 30.0
 *               temperature_optimal:
 *                 type: number
 *                 format: float
 *                 description: Optimal temperature
 *                 example: 25.0
 *               humidity_min:
 *                 type: number
 *                 format: float
 *                 description: Minimum humidity
 *                 example: 40.0
 *               humidity_max:
 *                 type: number
 *                 format: float
 *                 description: Maximum humidity
 *                 example: 60.0
 *               humidity_optimal:
 *                 type: number
 *                 format: float
 *                 description: Optimal humidity
 *                 example: 50.0
 *               brightness_min:
 *                 type: number
 *                 format: float
 *                 description: Minimum brightness
 *                 example: 200
 *               brightness_max:
 *                 type: number
 *                 format: float
 *                 description: Maximum brightness
 *                 example: 1000
 *               brightness_optimal:
 *                 type: number
 *                 format: float
 *                 description: Optimal brightness
 *                 example: 500
 *               pH_min:
 *                 type: number
 *                 format: float
 *                 description: Minimum pH
 *                 example: 6.0
 *               pH_max:
 *                 type: number
 *                 format: float
 *                 description: Maximum pH
 *                 example: 7.5
 *               pH_optimal:
 *                 type: number
 *                 format: float
 *                 description: Optimal pH
 *                 example: 6.5
 *               CO2_min:
 *                 type: number
 *                 format: float
 *                 description: Minimum CO2 level
 *                 example: 300
 *               CO2_max:
 *                 type: number
 *                 format: float
 *                 description: Maximum CO2 level
 *                 example: 1000
 *               CO2_optimal:
 *                 type: number
 *                 format: float
 *                 description: Optimal CO2 level
 *                 example: 700
 *               EC_min:
 *                 type: number
 *                 format: float
 *                 description: Minimum EC (Electrical Conductivity)
 *                 example: 1.0
 *               EC_max:
 *                 type: number
 *                 format: float
 *                 description: Maximum EC (Electrical Conductivity)
 *                 example: 2.5
 *               EC_optimal:
 *                 type: number
 *                 format: float
 *                 description: Optimal EC (Electrical Conductivity)
 *                 example: 1.8
 *               TDS_min:
 *                 type: number
 *                 format: float
 *                 description: Minimum TDS (Total Dissolved Solids)
 *                 example: 200
 *               TDS_max:
 *                 type: number
 *                 format: float
 *                 description: Maximum TDS (Total Dissolved Solids)
 *                 example: 600
 *               TDS_optimal:
 *                 type: number
 *                 format: float
 *                 description: Optimal TDS (Total Dissolved Solids)
 *                 example: 400
 *     responses:
 *       '201':
 *         description: Data inserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Data inserted successfully
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: Error inserting data
 */
router.post("/updatePlantSensorInfo", async (req, res) => {
  try {
    try {
      // Extracting data from req.body
      const {
        plantId,
        temperature_min,
        temperature_max,
        temperature_optimal,
        humidity_min,
        humidity_max,
        humidity_optimal,
        brightness_min,
        brightness_max,
        brightness_optimal,
        pH_min,
        pH_max,
        pH_optimal,
        CO2_min,
        CO2_max,
        CO2_optimal,
        EC_min,
        EC_max,
        EC_optimal,
        TDS_min,
        TDS_max,
        TDS_optimal,
      } = req.body;

      let success = 0;

      // Validation for PlantId (INT)
      if (typeof plantId === "undefined" || isNaN(parseInt(plantId))) {
        return sendInternalServerError(res, "Invalid Plant Id");
      }
      // Validation for Temperature_min (FLOAT)
      if (
        typeof temperature_min === "undefined" ||
        isNaN(parseFloat(temperature_min))
      ) {
        return sendInternalServerError(res, "Invalid Temperature_min");
      }

      // Validation for Temperature_max (FLOAT)
      if (
        typeof temperature_max === "undefined" ||
        isNaN(parseFloat(temperature_max))
      ) {
        return sendInternalServerError(res, "Invalid Temperature_max");
      }

      // Validation for Temperature_optimal (FLOAT)
      if (
        typeof temperature_optimal === "undefined" ||
        isNaN(parseFloat(temperature_optimal))
      ) {
        return sendInternalServerError(res, "Invalid Temperature_optimal");
      }

      // Validation for Humidity_min (FLOAT)
      if (
        typeof humidity_min === "undefined" ||
        isNaN(parseFloat(humidity_min))
      ) {
        return sendInternalServerError(res, "Invalid Humidity_min");
      }

      // Validation for Humidity_max (FLOAT)
      if (
        typeof humidity_max === "undefined" ||
        isNaN(parseFloat(humidity_max))
      ) {
        return sendInternalServerError(res, "Invalid Humidity_max");
      }

      // Validation for Humidity_optimal (FLOAT)
      if (
        typeof humidity_optimal === "undefined" ||
        isNaN(parseFloat(humidity_optimal))
      ) {
        return sendInternalServerError(res, "Invalid Humidity_optimal");
      }

      // Validation for Brightness_min (FLOAT)
      if (
        typeof brightness_min === "undefined" ||
        isNaN(parseFloat(brightness_min))
      ) {
        return sendInternalServerError(res, "Invalid Brightness_min");
      }

      // Validation for Brightness_max (FLOAT)
      if (
        typeof brightness_max === "undefined" ||
        isNaN(parseFloat(brightness_max))
      ) {
        return sendInternalServerError(res, "Invalid Brightness_max");
      }

      // Validation for Brightness_optimal (FLOAT)
      if (
        typeof brightness_optimal === "undefined" ||
        isNaN(parseFloat(brightness_optimal))
      ) {
        return sendInternalServerError(res, "Invalid Brightness_optimal");
      }

      // Validation for pH_min (FLOAT)
      if (typeof pH_min === "undefined" || isNaN(parseFloat(pH_min))) {
        return sendInternalServerError(res, "Invalid pH_min");
      }

      // Validation for pH_max (FLOAT)
      if (typeof pH_max === "undefined" || isNaN(parseFloat(pH_max))) {
        return sendInternalServerError(res, "Invalid pH_max");
      }

      // Validation for pH_optimal (FLOAT)
      if (typeof pH_optimal === "undefined" || isNaN(parseFloat(pH_optimal))) {
        return sendInternalServerError(res, "Invalid pH_optimal");
      }

      // Validation for CO2_min (FLOAT)
      if (typeof CO2_min === "undefined" || isNaN(parseFloat(CO2_min))) {
        return sendInternalServerError(res, "Invalid CO2_min");
      }

      // Validation for CO2_max (FLOAT)
      if (typeof CO2_max === "undefined" || isNaN(parseFloat(CO2_max))) {
        return sendInternalServerError(res, "Invalid CO2_max");
      }

      // Validation for CO2_optimal (FLOAT)
      if (
        typeof CO2_optimal === "undefined" ||
        isNaN(parseFloat(CO2_optimal))
      ) {
        return sendInternalServerError(res, "Invalid CO2_optimal");
      }

      // Validation for EC_min (FLOAT)
      if (typeof EC_min === "undefined" || isNaN(parseFloat(EC_min))) {
        return sendInternalServerError(res, "Invalid EC_min");
      }

      // Validation for EC_max (FLOAT)
      if (typeof EC_max === "undefined" || isNaN(parseFloat(EC_max))) {
        return sendInternalServerError(res, "Invalid EC_max");
      }

      // Validation for EC_optimal (FLOAT)
      if (typeof EC_optimal === "undefined" || isNaN(parseFloat(EC_optimal))) {
        return sendInternalServerError(res, "Invalid EC_optimal");
      }

      // Validation for TDS_min (FLOAT)
      if (typeof TDS_min === "undefined" || isNaN(parseFloat(TDS_min))) {
        return sendInternalServerError(res, "Invalid TDS_min");
      }

      // Validation for TDS_max (FLOAT)
      if (typeof TDS_max === "undefined" || isNaN(parseFloat(TDS_max))) {
        return sendInternalServerError(res, "Invalid TDS_max");
      }

      // Validation for TDS_optimal (FLOAT)
      if (
        typeof TDS_optimal === "undefined" ||
        isNaN(parseFloat(TDS_optimal))
      ) {
        return sendInternalServerError(res, "Invalid TDS_optimal");
      }
      //Since all the test passed, then I will need to update the plant seed info.
      success = await mysqlLogic.updatePlantSensorInfo({
        plantId: parseInt(plantId),
        humidity_min: parseFloat(humidity_min),
        humidity_max: parseFloat(humidity_max),
        humidity_optimal: parseFloat(humidity_optimal),
        brightness_min: parseFloat(brightness_min),
        brightness_max: parseFloat(brightness_max),
        brightness_optimal: parseFloat(brightness_optimal),
        pH_min: parseFloat(pH_min),
        pH_max: parseFloat(pH_max),
        pH_optimal: parseFloat(pH_optimal),
        CO2_min: parseFloat(CO2_min),
        CO2_max: parseFloat(CO2_max),
        CO2_optimal: parseFloat(CO2_optimal),
        EC_min: parseFloat(EC_min),
        EC_max: parseFloat(EC_max),
        EC_optimal: parseFloat(EC_optimal),
        TDS_min: parseFloat(TDS_min),
        TDS_max: parseFloat(TDS_max),
        TDS_optimal: parseFloat(TDS_optimal),
        temperature_min: parseFloat(temperature_min),
        temperature_max: parseFloat(temperature_max),
        temperature_optimal: parseFloat(temperature_optimal),
      });

      if (success) {
        res
          .status(201)
          .json({ success: success, message: "Data inserted successfully" });
      } else {
        sendInternalServerError(res, "Data insertion failed.");
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res, error);
    }
  } catch (error) {
    sendBadRequestResponse(res, error);
  }
});

router.post("/updatePlantInfo", async (req, res) => {
  try {
    try {
      // Extracting data from req.body
      const {
        plantId,
        plantName,
        plantPicture,
        daysToMature,
        currentSeedInventory,
        temperature_min,
        temperature_max,
        temperature_optimal,
        humidity_min,
        humidity_max,
        humidity_optimal,
        brightness_min,
        brightness_max,
        brightness_optimal,
        pH_min,
        pH_max,
        pH_optimal,
        CO2_min,
        CO2_max,
        CO2_optimal,
        EC_min,
        EC_max,
        EC_optimal,
        TDS_min,
        TDS_max,
        TDS_optimal,
      } = req.body;

      let success = 0;

      // Validation for PlantId (INT)
      if (typeof plantId === "undefined" || isNaN(parseInt(plantId))) {
        return sendInternalServerError(res, "Invalid Plant Id");
      }
      // Validation for Temperature_min (FLOAT)
      if (
        typeof temperature_min === "undefined" ||
        isNaN(parseFloat(temperature_min))
      ) {
        return sendInternalServerError(res, "Invalid Temperature_min");
      }

      // Validation for Temperature_max (FLOAT)
      if (
        typeof temperature_max === "undefined" ||
        isNaN(parseFloat(temperature_max))
      ) {
        return sendInternalServerError(res, "Invalid Temperature_max");
      }

      // Validation for Temperature_optimal (FLOAT)
      if (
        typeof temperature_optimal === "undefined" ||
        isNaN(parseFloat(temperature_optimal))
      ) {
        return sendInternalServerError(res, "Invalid Temperature_optimal");
      }

      // Validation for Humidity_min (FLOAT)
      if (
        typeof humidity_min === "undefined" ||
        isNaN(parseFloat(humidity_min))
      ) {
        return sendInternalServerError(res, "Invalid Humidity_min");
      }

      // Validation for Humidity_max (FLOAT)
      if (
        typeof humidity_max === "undefined" ||
        isNaN(parseFloat(humidity_max))
      ) {
        return sendInternalServerError(res, "Invalid Humidity_max");
      }

      // Validation for Humidity_optimal (FLOAT)
      if (
        typeof humidity_optimal === "undefined" ||
        isNaN(parseFloat(humidity_optimal))
      ) {
        return sendInternalServerError(res, "Invalid Humidity_optimal");
      }

      // Validation for Brightness_min (FLOAT)
      if (
        typeof brightness_min === "undefined" ||
        isNaN(parseFloat(brightness_min))
      ) {
        return sendInternalServerError(res, "Invalid Brightness_min");
      }

      // Validation for Brightness_max (FLOAT)
      if (
        typeof brightness_max === "undefined" ||
        isNaN(parseFloat(brightness_max))
      ) {
        return sendInternalServerError(res, "Invalid Brightness_max");
      }

      // Validation for Brightness_optimal (FLOAT)
      if (
        typeof brightness_optimal === "undefined" ||
        isNaN(parseFloat(brightness_optimal))
      ) {
        return sendInternalServerError(res, "Invalid Brightness_optimal");
      }

      // Validation for pH_min (FLOAT)
      if (typeof pH_min === "undefined" || isNaN(parseFloat(pH_min))) {
        return sendInternalServerError(res, "Invalid pH_min");
      }

      // Validation for pH_max (FLOAT)
      if (typeof pH_max === "undefined" || isNaN(parseFloat(pH_max))) {
        return sendInternalServerError(res, "Invalid pH_max");
      }

      // Validation for pH_optimal (FLOAT)
      if (typeof pH_optimal === "undefined" || isNaN(parseFloat(pH_optimal))) {
        return sendInternalServerError(res, "Invalid pH_optimal");
      }

      // Validation for CO2_min (FLOAT)
      if (typeof CO2_min === "undefined" || isNaN(parseFloat(CO2_min))) {
        return sendInternalServerError(res, "Invalid CO2_min");
      }

      // Validation for CO2_max (FLOAT)
      if (typeof CO2_max === "undefined" || isNaN(parseFloat(CO2_max))) {
        return sendInternalServerError(res, "Invalid CO2_max");
      }

      // Validation for CO2_optimal (FLOAT)
      if (
        typeof CO2_optimal === "undefined" ||
        isNaN(parseFloat(CO2_optimal))
      ) {
        return sendInternalServerError(res, "Invalid CO2_optimal");
      }

      // Validation for EC_min (FLOAT)
      if (typeof EC_min === "undefined" || isNaN(parseFloat(EC_min))) {
        return sendInternalServerError(res, "Invalid EC_min");
      }

      // Validation for EC_max (FLOAT)
      if (typeof EC_max === "undefined" || isNaN(parseFloat(EC_max))) {
        return sendInternalServerError(res, "Invalid EC_max");
      }

      // Validation for EC_optimal (FLOAT)
      if (typeof EC_optimal === "undefined" || isNaN(parseFloat(EC_optimal))) {
        return sendInternalServerError(res, "Invalid EC_optimal");
      }

      // Validation for TDS_min (FLOAT)
      if (typeof TDS_min === "undefined" || isNaN(parseFloat(TDS_min))) {
        return sendInternalServerError(res, "Invalid TDS_min");
      }

      // Validation for TDS_max (FLOAT)
      if (typeof TDS_max === "undefined" || isNaN(parseFloat(TDS_max))) {
        return sendInternalServerError(res, "Invalid TDS_max");
      }

      // Validation for TDS_optimal (FLOAT)
      if (
        typeof TDS_optimal === "undefined" ||
        isNaN(parseFloat(TDS_optimal))
      ) {
        return sendInternalServerError(res, "Invalid TDS_optimal");
      }
      //Since all the test passed, then I will need to update the plant seed info.
      success = await mysqlLogic.updatePlantSensorInfo({
        plantId: parseInt(plantId),
        humidity_min: parseFloat(humidity_min),
        humidity_max: parseFloat(humidity_max),
        humidity_optimal: parseFloat(humidity_optimal),
        brightness_min: parseFloat(brightness_min),
        brightness_max: parseFloat(brightness_max),
        brightness_optimal: parseFloat(brightness_optimal),
        pH_min: parseFloat(pH_min),
        pH_max: parseFloat(pH_max),
        pH_optimal: parseFloat(pH_optimal),
        CO2_min: parseFloat(CO2_min),
        CO2_max: parseFloat(CO2_max),
        CO2_optimal: parseFloat(CO2_optimal),
        EC_min: parseFloat(EC_min),
        EC_max: parseFloat(EC_max),
        EC_optimal: parseFloat(EC_optimal),
        TDS_min: parseFloat(TDS_min),
        TDS_max: parseFloat(TDS_max),
        TDS_optimal: parseFloat(TDS_optimal),
        temperature_min: parseFloat(temperature_min),
        temperature_max: parseFloat(temperature_max),
        temperature_optimal: parseFloat(temperature_optimal),
      });

      if (success) {
        res
          .status(201)
          .json({ success: success, message: "Data inserted successfully" });
      } else {
        sendInternalServerError(res, "Data insertion failed.");
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res, error);
    }
  } catch (error) {
    sendBadRequestResponse(res, error);
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
 *                 type: String
 *                 example: A1
 *               quantityPlanted:
 *                 type: integer
 *                 example: 5
 *               datePlanted:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-22 12:00:00"
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
        sendInternalServerError(res, "Invalid Plant Id.");
        return;
      } else if (plantLocation === undefined) {
        // console.log('fail at plantLocation');
        sendInternalServerError(res, "Invalid Plant Location.");
        return;
      } else if (microcontrollerId === undefined) {
        // console.log("fail at microcontroller");
        sendInternalServerError(res, "Invalid Microcontroller Id");
        return;
      } else if (
        quantityPlanted === undefined ||
        isNaN(parseInt(quantityPlanted)) ||
        parseInt(quantityPlanted) <= 0
      ) {
        sendInternalServerError(res, "Invalid quantity of plants planted.");
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
        sendInternalServerError(res, "Data insertion failed.");
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
      sendInternalServerError(res, "Plant Batch Id is invalid.");
      return;
    } else if (
      quantityHarvested === undefined ||
      isNaN(parseInt(quantityHarvested))
    ) {
      sendInternalServerError(res, "Quantity harvested is invalid.");
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
      sendInternalServerError(res, "Data Insertion Failed");
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
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
    let rows = await mysqlLogic.getAllSensorData();
    console.log(rows);
    if (rows) {
      console.log(rows);
      rows = groupSensorDataByPlantType(rows);
      res.status(200).json({ success: 1, result: rows });
    } else {
      res.json({ success: 1, message: "No sensor data available" });
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
  }
});

/**
 * @swagger
 * /plant/retrieveActivePlantBatchSensorData:
 *   get:
 *     tags: [Plant]
 *     description: Retrieve active plant batch sensor data
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Datetime:
 *                     type: string
 *                     format: date-time
 *                   MicrocontrollerID:
 *                     type: string
 *                   PlantBatchId:
 *                     type: integer
 *                   Temperature:
 *                     type: number
 *                   Humidity:
 *                     type: integer
 *                   Brightness:
 *                     type: integer
 *                   pH:
 *                     type: number
 *                   CO2:
 *                     type: number
 *                   EC:
 *                     type: number
 *                   TDS:
 *                     type: number
 *                   PlantId:
 *                     type: integer
 *                   Temperature_min:
 *                     type: number
 *                   Temperature_max:
 *                     type: number
 *                   Temperature_optimal:
 *                     type: number
 *                   Humidity_min:
 *                     type: integer
 *                   Humidity_max:
 *                     type: integer
 *                   Humidity_optimal:
 *                     type: integer
 *                   Brightness_min:
 *                     type: integer
 *                   Brightness_max:
 *                     type: integer
 *                   Brightness_optimal:
 *                     type: integer
 *                   pH_min:
 *                     type: number
 *                   pH_max:
 *                     type: number
 *                   pH_optimal:
 *                     type: number
 *                   CO2_min:
 *                     type: number
 *                   CO2_max:
 *                     type: number
 *                   CO2_optimal:
 *                     type: number
 *                   EC_min:
 *                     type: number
 *                   EC_max:
 *                     type: number
 *                   EC_optimal:
 *                     type: number
 *                   TDS_min:
 *                     type: number
 *                   TDS_max:
 *                     type: number
 *                   TDS_optimal:
 *                     type: number
 */
router.get("/retrieveActivePlantBatchSensorData", async (req, res) => {
  try {
    let rows = await mysqlLogic.getActivePlantBatchSensorData();
    console.log(rows);
    if (rows) {
      console.log(rows);
      rows = groupSensorDataByPlantType(rows);
      res.status(200).json({ success: 1, result: rows });
    } else {
      res.json({ success: 1, message: "No sensor data available" });
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
  }
});

/**
 * @swagger
 * /plant/retrieveLatestActivePlantBatchSensorData:
 *   get:
 *     tags: [Plant]
 *     description: Retrieve active plant batch sensor data
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Datetime:
 *                     type: string
 *                     format: date-time
 *                   MicrocontrollerID:
 *                     type: string
 *                   PlantBatchId:
 *                     type: integer
 *                   Temperature:
 *                     type: number
 *                   Humidity:
 *                     type: integer
 *                   Brightness:
 *                     type: integer
 *                   pH:
 *                     type: number
 *                   CO2:
 *                     type: number
 *                   EC:
 *                     type: number
 *                   TDS:
 *                     type: number
 *                   PlantId:
 *                     type: integer
 *                   Temperature_min:
 *                     type: number
 *                   Temperature_max:
 *                     type: number
 *                   Temperature_optimal:
 *                     type: number
 *                   Humidity_min:
 *                     type: integer
 *                   Humidity_max:
 *                     type: integer
 *                   Humidity_optimal:
 *                     type: integer
 *                   Brightness_min:
 *                     type: integer
 *                   Brightness_max:
 *                     type: integer
 *                   Brightness_optimal:
 *                     type: integer
 *                   pH_min:
 *                     type: number
 *                   pH_max:
 *                     type: number
 *                   pH_optimal:
 *                     type: number
 *                   CO2_min:
 *                     type: number
 *                   CO2_max:
 *                     type: number
 *                   CO2_optimal:
 *                     type: number
 *                   EC_min:
 *                     type: number
 *                   EC_max:
 *                     type: number
 *                   EC_optimal:
 *                     type: number
 *                   TDS_min:
 *                     type: number
 *                   TDS_max:
 *                     type: number
 *                   TDS_optimal:
 *                     type: number
 */
router.get("/retrieveLatestActivePlantBatchSensorData", async (req, res) => {
  try {
    let rows = await mysqlLogic.getLatestActivePlantBatchSensorData();
    console.log(rows);
    if (rows) {
      // console.log(rows);
      rows = groupSensorDataByPlantType(rows);
      // console.log(rows);
      rows = appendStatusToLatestSensorReadings(rows);
      // console.log(rows)
      res.status(200).json({ success: 1, result: rows });
    } else {
      res.json({ success: 1, message: "No sensor data available" });
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
  }
});

/**
 * @swagger
 * /plant/retrieveActivePlantBatchSensorData/{numDaysAgo}:
 *   get:
 *     tags: [Plant]
 *     description: Retrieve active plant batch sensor data for the past {numDaysAgo} days
 *     parameters:
 *       - in: path
 *         name: numDaysAgo
 *         schema:
 *           type: integer
 *         required: true
 *         description: Number of days to retrieve data for
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Datetime:
 *                     type: string
 *                     format: date-time
 *                   MicrocontrollerID:
 *                     type: string
 *                   PlantBatchId:
 *                     type: integer
 *                   Temperature:
 *                     type: number
 *                   Humidity:
 *                     type: integer
 *                   Brightness:
 *                     type: integer
 *                   pH:
 *                     type: number
 *                   CO2:
 *                     type: number
 *                   EC:
 *                     type: number
 *                   TDS:
 *                     type: number
 *                   PlantId:
 *                     type: integer
 *                   Temperature_min:
 *                     type: number
 *                   Temperature_max:
 *                     type: number
 *                   Temperature_optimal:
 *                     type: number
 *                   Humidity_min:
 *                     type: integer
 *                   Humidity_max:
 *                     type: integer
 *                   Humidity_optimal:
 *                     type: integer
 *                   Brightness_min:
 *                     type: integer
 *                   Brightness_max:
 *                     type: integer
 *                   Brightness_optimal:
 *                     type: integer
 *                   pH_min:
 *                     type: number
 *                   pH_max:
 *                     type: number
 *                   pH_optimal:
 *                     type: number
 *                   CO2_min:
 *                     type: number
 *                   CO2_max:
 *                     type: number
 *                   CO2_optimal:
 *                     type: number
 *                   EC_min:
 *                     type: number
 *                   EC_max:
 *                     type: number
 *                   EC_optimal:
 *                     type: number
 *                   TDS_min:
 *                     type: number
 *                   TDS_max:
 *                     type: number
 *                   TDS_optimal:
 *                     type: number
 */
router.get(
  "/retrieveActivePlantBatchSensorData/:numDaysAgo",
  async (req, res) => {
    try {
      let { numDaysAgo } = req.params;
      numDaysAgo = parseInt(numDaysAgo);
      if (!numDaysAgo) {
        sendInternalServerError(res, "numDaysAgo is not valid!");
      }
      let rows = await mysqlLogic.getActivePlantBatchSensorDataXDaysAgo(
        numDaysAgo
      );
      console.log(rows);
      if (rows) {
        console.log(rows);
        rows = groupSensorDataByPlantType(rows);
        res.status(200).json({ success: 1, result: rows });
      } else {
        res.json({ success: 1, message: "No sensor data available" });
      }
    } catch (error) {
      console.log("Error retrieving data:", error);
      sendInternalServerError(res, error);
    }
  }
);

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
    const rows = await mysqlLogic.getAllPlantSeedInventory();
    res.status(200).json({ success: 1, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
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
    const rows = await mysqlLogic.getAllPlantInfo();
    success = 1;
    res.status(200).json({ success: success, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
  }
});

/**
 * @swagger
 * /plant/plantYield:
 *   get:
 *     summary: Get plant yield rate data.
 *     tags: [Plant]
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
    const rows = await mysqlLogic.getAllPlantYieldRate();
    console.log(rows);
    success = 1;
    res.status(200).json({ success: success, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
  }
});

/**
 * @swagger
 * /plant/plantBatchInfoAndYield:
 *   get:
 *     summary: Get information about plant batches and their yields.
 *     tags: [Plant]
 *     responses:
 *       200:
 *         description: Successful response. Returns plant batch info and yield data.
 *         content:
 *           application/json:
 *             example:
 *               success: 1
 *               result:
 *                 - PlantBatchId: 1
 *                   PlantId: 123
 *                   PlantName: "Sample Plant"
 *                   DatePlanted: "2024-01-22T12:00:00"
 *                   ExpectedHarvestDate: "2024-02-22T12:00:00"
 *                   QuantityPlanted: 100
 *                   YieldRate: 0.75
 */
router.get("/plantBatchInfoAndYield", async (req, res) => {
  try {
    let success = 0;
    const rows = await mysqlLogic.getAllPlantBatchInfoAndYield();
    console.log(rows);
    success = 1;
    res.status(200).json({ success: success, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
  }
});

/**
 * @swagger
 * /plant/allPlantBatchInfo:
 *   get:
 *     summary: Retrieve all plant batch information
 *     description: Retrieve all plant batch information including joined plant information from the database.
 *     tags: [Plant]
 *     responses:
 *       200:
 *         description: Successful response with plant batch information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   description: Indicates the success status of the request (0 for failure, 1 for success).
 *                 result:
 *                   type: array
 *                   description: Array containing plant batch information retrieved from the database.
 *                   items:
 *                     type: object
 *                     properties:
 *                       PlantBatchId:
 *                         type: integer
 *                         description: ID of the plant batch.
 *                       PlantId:
 *                         type: integer
 *                         description: ID of the plant associated with the batch.
 *                       PlantLocation:
 *                         type: string
 *                         description: Location where the plant batch is planted.
 *                       QuantityPlanted:
 *                         type: integer
 *                         description: Quantity of plants planted in the batch.
 *                       QuantityHarvested:
 *                         type: integer
 *                         description: Quantity of plants harvested from the batch.
 *                       DatePlanted:
 *                         type: string
 *                         format: date-time
 *                         description: Date when the plants were planted in the batch.
 *                       DateHarvested:
 *                         type: string
 *                         format: date-time
 *                         description: Date when the plants were harvested from the batch.
 *                       PlantName:
 *                         type: string
 *                         description: Name of the plant associated with the batch.
 *                       PlantPicture:
 *                         type: string
 *                         format: binary
 *                         description: Picture of the plant associated with the batch (in binary format).
 *                       SensorsRanges:
 *                         type: integer
 *                         description: Number indicating the range of sensors used for monitoring the plant.
 *                       DaysToMature:
 *                         type: integer
 *                         description: Number of days required for the plant to mature.
 *                       CurrentSeedInventory:
 *                         type: integer
 *                         description: Current inventory of seeds for the plant.
 *                       TotalHarvestSold:
 *                         type: integer
 *                         description: Total quantity of harvested plants sold.
 *                       TotalHarvestDiscarded:
 *                         type: integer
 *                         description: Total quantity of harvested plants discarded.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the internal server error.
 */
router.get("/allPlantBatchInfo", async (req, res) => {
  try {
    let success = 0;
    const rows = await mysqlLogic.getAllPlantBatchInfo();
    console.log(rows);
    success = 1;
    res.status(200).json({ success: success, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
  }
});

/**
 * @swagger
 * /plant/availableExisitingMicrocontroller:
 *   get:
 *     summary: Get available existing microcontroller IDs
 *     tags: [Microcontrollers]
 *     description: Retrieve microcontroller IDs where the associated plant batch ID is not null.
 *     responses:
 *       200:
 *         description: Successful response with available microcontroller IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   description: Indicates if the operation was successful (1) or not (0).
 *                   example: 1
 *                 result:
 *                   type: array
 *                   description: An array of microcontroller IDs where the associated plant batch ID is not null.
 *                   items:
 *                     type: string
 *                   example: ["microcontroller1", "microcontroller2"]
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   description: Indicates if the operation was successful (1) or not (0).
 *                   example: 0
 *                 message:
 *                   type: string
 *                   description: Error message describing the encountered issue.
 *                   example: Internal Server Error
 */
router.get("/availableExisitingMicrocontroller", async (req, res) => {
  try {
    let success = 0;
    const rows = await mysqlLogic.getAvailableExisitingMicrocontroller();
    console.log(rows);
    success = 1;
    res.status(200).json({ success: success, result: rows });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
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
