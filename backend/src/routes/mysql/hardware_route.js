const { json } = require("express");
const express = require("express");
const router = express.Router();
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")
const errorCode = require("./error_code.js");

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




module.exports = router;