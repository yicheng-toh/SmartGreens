const { json } = require("express");
const express = require("express");
const router = express.Router();
const {
  sendBadRequestResponse,
  sendInternalServerError,
} = require("../request_error_messages.js");
const mysqlLogic = require("../../database_logic/sql/sql.js");
const errorCode = require("./error_code.js");

router.use(json());
/**
 * @swagger
 * tags:
 *   name: PlantBatch
 *   description: Routes for plant-related data
 */

/**
 * @swagger
 * /plant/editPlantBatchDetails:
 *   post:
 *     summary: Edit plant batch details
 *     tags: [PlantBatch]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantBatchId:
 *                 example: 1
 *                 type: integer
 *               datePlanted:
 *                 type: string
 *                 format: date-time
 *               quantityPlanted:
 *                 type: integer
 *               quantityHarvested:
 *                 type: integer
 *               dateHarvested:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       '200':
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/editPlantBatchDetails", async (req, res) => {
  try {
    let success = 0;
    let {
      plantBatchId,
      datePlanted,
      quantityPlanted,
      quantityHarvested,
      dateHarvested,
    } = req.body;
    if (plantBatchId === undefined || isNaN(parseInt(plantBatchId))) {
      sendInternalServerError(res, "Plant Batch Id is invalid.");
      return;
    }
    if (quantityPlanted === undefined || isNaN(parseInt(quantityPlanted))) {
      sendInternalServerError(res, "Quantity Planted is invalid.");
      return;
    }
    if (datePlanted === undefined) {
      // const plantBatchId = -1;
      datePlanted = new Date();
      // console.log(currentUTCDateTime);
      datePlanted.setHours(datePlanted.getHours() + 8); //GMT + 8
      datePlanted = datePlanted.toISOString;
    }
    let formattedDateTimePlanted = datePlanted.slice(0, 19).replace("T", " ");

    let isPlantBatchGrowing =
      await mysqlLogic.verifyPlantBatchIsGrowing(plantBatchId);
      console.log("isPlantBatchGrowing", isPlantBatchGrowing);
    if (isPlantBatchGrowing) {
        console.log("plantbatch", plantBatchId, "is growing");
      //edit the entries' date planted and quantity plamted
      success = await mysqlLogic.updateGrowingPlantBatchDetails(
        plantBatchId,
        formattedDateTimePlanted,
        quantityPlanted
      );
    } else {
        console.log("plantbatch", plantBatchId, "is harvested");
      //check the edit entries
      if (
        quantityHarvested === undefined ||
        isNaN(parseInt(quantityHarvested))
      ) {
        sendInternalServerError(res, "Quantity Harvested is invalid.");
        return;
      }
      if (dateHarvested === undefined) {
        dateHarvested = new Date();
        // console.log(currentUTCDateTime);
        dateHarvested.setHours(dateHarvested.getHours() + 8); //GMT + 8
        dateHarvested = dateHarvested.toISOString;
      }

      let formattedDateTimeHarvested = dateHarvested
        .slice(0, 19)
        .replace("T", " ");
      if (
        new Date(formattedDateTimeHarvested) <
        new Date(formattedDateTimePlanted)
      ) {
        sendInternalServerError(
          res,
          "Date harvested cannot be earlier than date planted"
        );
        return;
      }
      //get the date planted time.
      let success = await mysqlLogic.updateHarvestedPlantBatchDetails(
        plantBatchId,
        formattedDateTimePlanted,
        quantityPlanted,
        formattedDateTimeHarvested,
        quantityHarvested
      );
    }
    success = 1;
    res
      .status(200)
      .json({ success: success, message: "Data inserted successfully" });
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
  }
});

/**
 * @swagger
 * /plant/deletePlantBatch/{plantBatchId}:
 *   delete:
 *     summary: Delete a plant batch by ID
 *     tags: [PlantBatch]
 *     description: Delete a plant batch by its ID from the database.
 *     parameters:
 *       - in: path
 *         name: plantBatchId
 *         required: true
 *         description: Numeric ID of the plant batch to delete
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Success message indicating the deletion was successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   description: Indicates whether the deletion was successful (1) or not (0)
 *       500:
 *         description: Internal server error
 */
router.delete('/deletePlantBatch/:plantBatchId',async (req, res) => {
    // try{     
        try {
          let success = 0;
          const {plantBatchId} = req.params;
          if (isNaN(parseInt(plantBatchId))){
            sendInternalServerError(res, "Invalid Plant Batch Id.");
            return;
          }
          const isPlantBatchGrowing = await mysqlLogic.verifyPlantBatchIsGrowing(plantBatchId);
          if(isPlantBatchGrowing){
            //Harvest the plant before deleting
            dateHarvested = new Date();
            dateHarvested.setHours(dateHarvested.getHours() + 8); //GMT + 8
            dateHarvested = dateHarvested.toISOString();
            // console.log("dateHarvested is", dateHarvested);
            let formattedDateTimeHarvested = dateHarvested
            .slice(0, 19)
            .replace("T", " ");
            let quantityHarvested = 0;
            success = await mysqlLogic.harvestPlant(plantBatchId, formattedDateTimeHarvested, quantityHarvested);
          }
         
          success = await mysqlLogic.deletePlantBatch(plantBatchId);
          res.status(201).json({'success': success});
          return;
  
        } catch (error) {
          console.log('Error inserting data:', error);
          // sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
          sendInternalServerError(res, error);
          return;
        }
  });

/**
 * @swagger
 * /plant/allPlantBatchInfo:
 *   get:
 *     summary: Retrieve all plant batch information
 *     description: Retrieve all plant batch information including joined plant information from the database.
 *     tags: [PlantBatch]
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
 *     tags: [PlantBatch]
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
