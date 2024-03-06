const { json } = require("express");
const express = require("express");
const router = express.Router({mergeParams: true});
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")
/**
 * @swagger
 * tags:
 *   name: EnergyConsumption
 *   description: Routes for energy consumption data.
 */


/**
 * @swagger
 * /energyConsumption/getEnergyConsumptionValue:
 *   get:
 *     summary: Get energy consumption data.
 *     tags: [EnergyConsumption]
 *     description: Retrieve total energy consumption.
 *     responses:
 *       200:
 *         description: Successful response with data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   example: 1
 *                 result:
 *                   type: number
 *                   example: 100.5
 *       500:
 *         description: Internal Server Error.
 */
router.get('/getEnergyConsumptionValue', async(req, res) => {
    try {
      const rows = await mysqlLogic.getTotalEnergyConsumptionValue();
      if(rows.EnergyUsage === null){
        rows.EnergyUsage = 0;
      }
      rows.CarbonFootprint = rows.EnergyUsage * 0.4168;
      if(rows)
      res.status(200).json({success:1, result: rows});
    } catch (error) {
      console.log('Error retrieving data:', error);
      sendInternalServerError(res);
    }
});

/**
 * @swagger
 * /energyConsumption/insertNewEnergyConsumingDevice:
 *   post:
 *     summary: Insert a new Energy Consuming Device
 *     tags: [EnergyConsumption]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceName:
 *                 type: string
 *                 example: "Device A"
 *               quantity:
 *                 type: number
 *                 example: 10
 *               energyConsumption:
 *                 type: number
 *                 example: 5.5
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/insertNewEnergyConsumingDevice', async (req, res) => {   
        try {
          let success = 0;
          let {deviceName, quantity, energyConsumption} = req.body;
          if (deviceName === undefined || deviceName.length == 0){
            // sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
            sendInternalServerError(res, "Energy Consuming Device name is invalid.");
            return;
          }else if (quantity === undefined){
            quantity = 0;
          }else{
            quantity = parseInt(quantity);
          }
          if(quantity < 0 || isNaN(quantity)){
            // sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
            sendInternalServerError(res, "Quantity is invalid.");
            return;
          }
          if (energyConsumption === undefined){
            energyConsumption = 0;
          }else if(isNaN(parseFloat(energyConsumption))){
            sendInternalServerError(res, "Energy consumption value is invalid.");
            return;
          }else{
            energyConsumption = parseFloat(energyConsumption);
          }
          
          console.log(deviceName, quantity, energyConsumption);
          success = await mysqlLogic.insertNewEnergyConsumingDevice(deviceName, quantity, energyConsumption);
          res.status(201).json({"success": success, message:'Data inserted successfully'});
          return;
        } catch (error) {
          console.log('Error inserting data:', error);
          sendInternalServerError(res, error);
          return;
        }
});



/**
 * @swagger
 * /energyConsumption/updateEnergyConsumingDevice:
 *   post:
 *     summary: Update energy consuming device
 *     tags: [EnergyConsumption]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               deviceName:
 *                 type: string
 *                 example: "Device A"
 *               quantity:
 *                 type: number
 *                 example: 10
 *               energyConsumption:
 *                 type: number
 *                 example: 5.5
 *     responses:
 *       201:
 *         description: Data updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/updateEnergyConsumingDevice', async (req, res) => { 
      try {
        let success = 0;
        let {id, deviceName, quantity, energyConsumption} = req.body;

        if (id === undefined){
          sendInternalServerError(res, "Invalid Energy Consuming Device Id");
          return;
        }
        const isDeviceIdExist = await mysqlLogic.verifyEnergyConsumingDeviceIdExist(id);

        if (!isDeviceIdExist){
          sendInternalServerError(res,"Energy Consumption Device Id is not valid.");
          return;
        }

        if (deviceName === undefined || deviceName.length == 0){
          // sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
          sendInternalServerError(res, "Energy Consuming Device name is invalid.");
          return;
        }else if (quantity === undefined){
          quantity = 0;
        }else{
          quantity = parseInt(quantity);
        }
        if(quantity < 0 || isNaN(quantity)){
          // sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
          sendInternalServerError(res, "Quantity is invalid.");
          return;
        }
        if (energyConsumption === undefined){
          energyConsumption = 0;
        }else if(isNaN(parseFloat(energyConsumption))){
          sendInternalServerError(res, "Energy consumption value is invalid.");
          return;
        }else{
          energyConsumption = parseFloat(energyConsumption);
        }

        success =  await mysqlLogic.updateEnergyConsumingDevice(id, deviceName, quantity, energyConsumption);
        if(success){
          res.status(201).json({"success": success, message:'Data inserted successfully'});
        }else{
          res.status(500).json({"success": success, message:'Failed to update Energy Consuming Device.'});
        }
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
 * /energyConsumption/retrieveAllEnergyConsumingDevice:
 *   get:
 *     summary: Retrieve all energy consuming devices
 *     tags: [EnergyConsumption]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get('/retrieveAllEnergyConsumingDevice', async(req, res) => {
    try {
      //need to double check this with mssql. currently works on mysql
        const rows = await mysqlLogic.getAllEnergyConsumingDevice();
        res.status(200).send({'success': 1, 'result': rows});
        return;
    } catch (error) {
        console.log('Error retrieving data:', error);
        // sendInternalServerError(res, errorCode.DATABASE_OPERATION_ERROR);
        sendInternalServerError(res, error);
        return;
    }
});

/**
 * @swagger
 * /energyConsumption/deleteEnergyConsumingDevice/{currentEnergyConsumingDeviceId}:
 *   delete:
 *     summary: Delete an energy consuming device
 *     tags: [EnergyConsumption]
 *     parameters:
 *       - in: path
 *         name: currentEnergyConsumingDeviceId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       201:
 *         description: Data deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete('/deleteEnergyConsumingDevice/:currentEnergyConsumingDeviceId',async (req, res) => {
  // try{     
      try {
        let success = 0;
        const {currentEnergyConsumingDeviceId} = req.params;
        if (isNaN(parseInt(currentEnergyConsumingDeviceId))){
          sendInternalServerError(res, "Invalid Energy Consuming Device Id");
          return;
        }
        const isDeviceIdExist = await mysqlLogic.verifyEnergyConsumingDeviceIdExist(currentEnergyConsumingDeviceId);
        if(!isDeviceIdExist){
          console.log("isDeviceIdExist",isDeviceIdExist);
          sendInternalServerError(res, "Energy Cosuming Device Id does not exist.");
          return;
        }

        
        success = await mysqlLogic.deleteEnergyConsumingDevice(currentEnergyConsumingDeviceId);
        res.status(201).json({'success': success});
        return;

      } catch (error) {
        console.log('Error inserting data:', error);
        sendInternalServerError(res, error);
        return;
      }
});
 
module.exports = router;