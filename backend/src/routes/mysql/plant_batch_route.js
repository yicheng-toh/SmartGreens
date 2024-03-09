const { json } = require("express");
const express = require("express");
const router = express.Router();
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")
const errorCode = require("./error_code.js");

router.use(json());

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
 
module.exports = router;