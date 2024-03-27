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

/**
 * @swagger
 * /plant/updatePlantInfo:
 *   post:
 *     summary: Update plant information
 *     tags: [Plant]
 *     description: Update plant information in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantId:
 *                 type: integer
 *                 description: Numeric ID of the plant.
 *                 example: 1
 *               plantName:
 *                 type: string
 *                 description: Name of the plant.
 *                 example: "Tomato4"
 *               plantPicture:
 *                 type: string
 *                 description: URL or base64-encoded image of the plant picture.
 *                 example: null
 *               daysToMature:
 *                 type: integer
 *                 description: Number of days for the plant to mature.
 *                 example: 90
 *               currentSeedInventory:
 *                 type: integer
 *                 description: Current inventory count of seeds for the plant.
 *                 example: 950
 *     responses:
 *       201:
 *         description: Success message indicating the data was updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   description: Indicates whether the update was successful (1) or not (0).
 *                 message:
 *                   type: string
 *                   description: Message indicating the outcome of the operation.
 *       500:
 *         description: Internal server error
 */
router.post("/updatePlantInfo", async (req, res) => {
  try {
    try {
      // Extracting data from req.body
      let {
        plantId,
        plantName,
        plantPicture,
        daysToMature,
        currentSeedInventory,
      } = req.body;

      let success = 0;

      // Validation for PlantId (INT)
      if (typeof plantId === "undefined" || isNaN(parseInt(plantId))) {
        return sendInternalServerError(res, "Invalid Plant Id");
      }
      if (plantName === undefined || !plantName.trim().length){
        sendInternalServerError(res, "Invalid Plant Name");
        return;
      }
      if (daysToMature === undefined || isNaN(parseInt(daysToMature)) || parseInt(daysToMature) <= 0){
        sendInternalServerError(res, "Invalid value for daysToMature");
        return;
      }

      if (currentSeedInventory === undefined || isNaN(parseInt(currentSeedInventory)) || parseInt(currentSeedInventory) < 0){
        sendInternalServerError(res, "Invalid value for current seed inventory.");
        return;
      }
      if (plantPicture == undefined){
        plantPicture = null;
      }
      
      //update plant sensor info.
      success = await mysqlLogic.updatePlantInfo(plantId, plantName, plantPicture, daysToMature, currentSeedInventory);

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
 *                 type: String
 *                 example: "2A"
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
      plantLocation = plantLocation.toString();
      if (datePlanted === undefined || datePlanted === null){
        datePlanted = new Date();
        datePlanted.setHours(datePlanted.getHours() + 8); //GMT + 8
        datePlanted = datePlanted.toISOString();
        console.log("datePlanted is", datePlanted);
        datePlanted = datePlanted
          .slice(0, 19)
          .replace("T", " ");

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
 *               weightHarvested:
 *                 type: float
 *                 example: 3.1
 *               dateHarvested:
 *                 type: string
 *                 format: date-time
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
    let { plantBatchId, weightHarvested, dateHarvested } = req.body;
    if (plantBatchId === undefined || isNaN(parseInt(plantBatchId))) {
      sendInternalServerError(res, "Plant Batch Id is invalid.");
      return;
    } else if (
      weightHarvested === undefined ||
      isNaN(parseInt(weightHarvested))
    ) {
      sendInternalServerError(res, "Quantity harvested is invalid.");
      return;
    }
    plantBatchId = parseInt(plantBatchId);
    //need to check if the plant batch is grown and not harvseted.
    let isPlantBatchGrowing = await mysqlLogic.verifyPlantBatchIsGrowing(plantBatchId);
    if(!isPlantBatchGrowing){
      sendInternalServerError(res, "Plant Batch is not growing!");
      return;
    }
    weightHarvested = parseInt(weightHarvested);
    if (dateHarvested == null){
      dateHarvested = new Date();
      dateHarvested.setHours(dateHarvested.getHours() + 8); //GMT + 8
      dateHarvested = dateHarvested.toISOString();
      // console.log("dateHarvested is", dateHarvested);
      
    }
    dateHarvested = dateHarvested
        .slice(0, 19)
        .replace("T", " ");
    success = await mysqlLogic.harvestPlant(plantBatchId, dateHarvested, weightHarvested);
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


module.exports = router;
