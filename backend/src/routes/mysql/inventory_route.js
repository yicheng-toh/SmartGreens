const { json } = require("express");
const express = require("express");
const router = express.Router();
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")
const errorCode = require("./error_code.js");

router.use(json());

router.post('/insertNewInventory', async (req, res) => {   
        try {
          let success = 0;
          let {inventoryName, quantity, units, location} = req.body;
          if (inventoryName === undefined || !inventoryName.trim()){
            sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
            return;
          }else if (quantity === undefined){
            quantity = 0;
          }else{
            quantity = parseFloat(quantity);
          }
          if(quantity < 0 || isNaN(quantity)){
            sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
            return;
          }
          console.log(inventoryName,quantity, units, location);
          success = await mysqlLogic.insertNewInventoryObject(inventoryName, quantity, units, location);
          res.status(201).send({'success': success});
          return;
        } catch (error) {
          console.log('Error inserting data:', error);
          sendInternalServerError(res, errorCode.DATABASE_OPERATION_ERROR);
          return;
        }
});

router.post('/updateInventoryQuantity', async (req, res) => {
    try{     
        try {
          let success = 0;
          const {currentInventoryId, quantityChange} = req.body;
          if (currentInventoryId === undefined){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_UNDEFINED_INVENTORY_ID);
            return;
          }else if (quantityChange === undefined){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_UNDEFINED_QUANTITY_CHANGE);
            return;
          }
          //check if the id is in the database
          const isInventoryIdExist = await mysqlLogic.verifyInventoryIdExist(currentInventoryId);
          if (!isInventoryIdExist){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_UNDEFINED_QUANTITY_CHANGE);
            return;
          }else if (isNaN(parseFloat(quantityChange))){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_INVALID_QUANTITY_CHANGE);
            return;
          }
          success = await mysqlLogic.updateInventoryQuantity(currentInventoryId, quantityChange);
          res.status(201).send({'success': success});
        } catch (error) {
          console.log('Error inserting data:', error);
          sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
          return;
        }
    } catch (error) {
        console.log(error);
        sendBadRequestResponse(res);
        return;
    }
});

router.post('/updateInventoryUnit', async (req, res) => { 
      try {
        let success = 0;
        const {currentInventoryId, newUnit} = req.body;

        if (currentInventoryId === undefined){
          sendInternalServerError(res, errorCode.UPDATE_INVENTORY_UNIT_UNDEFINED_INVENTORY_ID);
          return;
        }
        const isInventoryIdExist = await mysqlLogic.verifyInventoryIdExist(currentInventoryId);

        if (!isInventoryIdExist){
          sendInternalServerError(res, errorCode.UPDATE_INVENTORY_UNIT_UNDEFINED_QUANTITY_CHANGE);
          return;
        }

        success =  await mysqlLogic.updateInventoryUnit(currentInventoryId, newUnit);
        res.status(201).send({'success': success});
        return;

      } catch (error) {
        console.log('Error inserting data:', error);
        sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
        return;
      }
});

router.get('/retrieveAllInventoryData', async(req, res) => {
    try {
      //need to double check this with mssql. currently works on mysql
        const [rows] = await mysqlLogic.getAllInventoryData();
        res.status(200).send({'success': 1, 'result': rows});
        return;
    } catch (error) {
        console.log('Error retrieving data:', error);
        sendInternalServerError(res, errorCode.DATABASE_OPERATION_ERROR);
        return;
    }
});

router.delete('/deleteInventory/:currentInventoryId',async (req, res) => {
  // try{     
      try {
        let success = 0;
        const {currentInventoryId} = req.params;
        const isInventoryIdExist = await mysqlLogic.verifyInventoryIdExist(currentInventoryId);
        console.log("isInventoryIdExist",isInventoryIdExist);

        if (isNaN(parseInt(currentInventoryId)) || !isInventoryIdExist){
          sendInternalServerError(res, errorCode.DELETE_INVENTORY_INVALID_INVENTORY_ID);
          return;
        }
        success = await mysqlLogic.deleteInventoryObject(currentInventoryId);
        res.status(201).send({'success': success});
        return;

      } catch (error) {
        console.log('Error inserting data:', error);
        sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
        return;
      }
});
 
module.exports = router;