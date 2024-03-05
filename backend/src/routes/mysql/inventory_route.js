const { json } = require("express");
const express = require("express");
const router = express.Router();
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")
const errorCode = require("./error_code.js");
/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory operations
 */

router.use(json());

/**
 * @swagger
 * /inventory/insertNewInventory:
 *   post:
 *     summary: Insert a new inventory item
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item:
 *                 type: string
 *                 example: "Product A"
 *               quantity:
 *                 type: number
 *                 example: 10
 *               units:
 *                 type: string
 *                 example: "pcs"
 *               location:
 *                 type: string
 *                 example: "Warehouse A"
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/insertNewInventory', async (req, res) => {   
        try {
          let success = 0;
          let {item, quantity, units, location} = req.body;
          if (item === undefined || !item.trim()){
            // sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
            sendInternalServerError(res, "Inventory name is invalid.");
            return;
          }else if (quantity === undefined){
            quantity = 0;
          }else{
            quantity = parseFloat(quantity);
          }
          if(quantity < 0 || isNaN(quantity)){
            // sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
            sendInternalServerError(res, "Quantity is invalid.");
            return;
          }
          if(units === undefined){
            units = null;
          }
          console.log(item,quantity, units, location);
          success = await mysqlLogic.insertNewInventoryObject(item, quantity, units, location);
          res.status(201).json({"success": success, message:'Data inserted successfully'});
          return;
        } catch (error) {
          console.log('Error inserting data:', error);
          // sendInternalServerError(res, errorCode.DATABASE_OPERATION_ERROR);
          sendInternalServerError(res, error);
          return;
        }
});

/**
 * @swagger
 * /inventory/updateInventoryQuantity:
 *   post:
 *     summary: Update inventory quantity
 *     tags: [Inventory]
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
 *               quantityChange:
 *                 type: number
 *                 example: 5
 *     responses:
 *       201:
 *         description: Data updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/updateInventoryQuantity', async (req, res) => {
    try{     
        try {
          let success = 0;
          let {id, quantityChange} = req.body;
          if (id === undefined || isNaN(parseInt(id))){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_UNDEFINED_INVENTORY_ID);
            return;
          }else if (quantityChange === undefined || isNaN(parseFloat(quantityChange))){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_UNDEFINED_QUANTITY_CHANGE);
            return;
          }
          //check if the id is in the database
          id = parseInt(id);
          quantityChange = parseFloat(quantityChange);
          const isInventoryIdExist = await mysqlLogic.verifyInventoryIdExist(id);
          if (!isInventoryIdExist){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_UNDEFINED_QUANTITY_CHANGE);
            return;
          // }else if (isNaN(parseFloat(quantityChange))){
          //   sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_INVALID_QUANTITY_CHANGE);
          //   return;
          }
          console.log("inventory id exist");
          success = await mysqlLogic.updateInventoryQuantity(id, quantityChange);
          res.status(201).json({"success": success, message:'Data inserted successfully'});
        } catch (error) {
          console.log('Error inserting data:', error);
          sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
          return;
        }
    } catch (error) {
        console.log(error);
        sendBadRequestResponse(res, error);
        return;
    }
});

/**
 * @swagger
 * /inventory/updateInventoryUnit:
 *   post:
 *     summary: Update inventory unit
 *     tags: [Inventory]
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
 *               units:
 *                 type: string
 *                 example: "kg"
 *     responses:
 *       201:
 *         description: Data updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/updateInventoryUnit', async (req, res) => { 
      try {
        let success = 0;
        const {id, units} = req.body;

        if (id === undefined){
          sendInternalServerError(res, errorCode.UPDATE_INVENTORY_UNIT_UNDEFINED_INVENTORY_ID);
          return;
        }
        const isInventoryIdExist = await mysqlLogic.verifyInventoryIdExist(id);

        if (!isInventoryIdExist){
          sendInternalServerError(res, errorCode.UPDATE_INVENTORY_UNIT_UNDEFINED_QUANTITY_CHANGE);
          return;
        }

        success =  await mysqlLogic.updateInventoryUnit(id, units);
        res.status(201).json({"success": success, message:'Data inserted successfully'});
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
 * /inventory/retrieveAllInventoryData:
 *   get:
 *     summary: Retrieve all inventory data
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */

router.get('/retrieveAllInventoryData', async(req, res) => {
    try {
      //need to double check this with mssql. currently works on mysql
        const rows = await mysqlLogic.getAllInventoryData();
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
 * /inventory/deleteInventory/{currentInventoryId}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: currentInventoryId
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
router.delete('/deleteInventory/:currentInventoryId',async (req, res) => {
  // try{     
      try {
        let success = 0;
        const {currentInventoryId} = req.params;
        if (isNaN(parseInt(currentInventoryId))){
          sendInternalServerError(res, errorCode.DELETE_INVENTORY_INVALID_INVENTORY_ID);
          return;
        }
        const isInventoryIdExist = await mysqlLogic.verifyInventoryIdExist(currentInventoryId);
        if(!isInventoryIdExist){
          console.log("isInventoryIdExist",isInventoryIdExist);
          sendInternalServerError(res, "Inventory Id does not exist.");
          return;
        }

        
        success = await mysqlLogic.deleteInventoryObject(currentInventoryId);
        res.status(201).json({'success': success});
        return;

      } catch (error) {
        console.log('Error inserting data:', error);
        // sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
        sendInternalServerError(res, error);
        return;
      }
});
 
module.exports = router;