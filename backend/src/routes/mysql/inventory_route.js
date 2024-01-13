/*
This file provides routes that are related to the amoutn of aw materials on the arm.
Some example includes the amount of 
- acidic solution
- akaline solution
- n solution
- p solution
- k solution

*/
const { json } = require("express");
const express = require("express");
const router = express.Router();
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")
const errorCode = require("./error_code.js");

router.use(json());

router.post('/insertNewInventory', async (req, res) => {
    try{     
        try {
          let success = 0;
          const {inventoryName, quantity, units} = res.body;
          if (inventoryName === undefined){
            sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
          }else if (quantity === undefined){
            quantity = 0;
          }else{
            quantity = parseFloat(quantity);
          }
          if(quantity < 0 || isNaN(quantity)){
            sendInternalServerError(res, errorCode.INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME);
          }
          success = await mysqlLogic.insertNewInventoryObject(inventoryName, quantity, units);
          res.status(201).send({'success': success});
        } catch (error) {
        console.error('Error inserting data:', error);
          sendInternalServerError(res, errorCode.DATABASE_OPERATION_ERROR);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});

router.post('/updateInventoryQuantity', async (req, res) => {
    try{     
        try {
          let success = 0;
          const {currentInventoryId, quantityChange} = res.body;
          if (currentInventoryId === undefined){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_UNDEFINED_INVENTORY_ID);
          }else if (quantityChange === undefined){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_UNDEFINED_QUANTITY_CHANGE);
          }
          //check if the id is in the database
          const isInventoryIdExist = await mysqlLogic.verifyInventoryIdExist(currentInventoryId);
          if (!isInventoryIdExist){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_UNDEFINED_QUANTITY_CHANGE);
          }else if (isNaN(parseFloat(quantityChange))){
            sendInternalServerError(res, errorCode.UPDATE_INVENTORY_QUANTITY_INVALID_QUANTITY_CHANGE);
          }
          success = mysqlLogic.updateInventoryQuantity(currentInventoryId, quantityChange);
          res.status(201).send({'success': success});
        } catch (error) {
          console.error('Error inserting data:', error);
          sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});

router.post('/updateInventoryUnit', async (req, res) => {
  try{     
      try {
        let success = 0;
        const {currentInventoryId, newUnit} = res.body;

        if (currentInvenotryId === undefined){
          sendInternalServerError(res, errorCode.UPDATE_INVENTORY_UNIT_UNDEFINED_INVENTORY_ID);
        }
        const isInventoryIdExist = await mysqlLogic.verifyInventoryIdExist(currentInventoryId);

        if (!isInventoryIdExist){
          sendInternalServerError(res, errorCode.UPDATE_INVENTORY_UNIT_UNDEFINED_QUANTITY_CHANGE);
        }

        success = mysqlLogic.updateInventoryUnit(currentInventoryId, newUnit);
        res.status(201).send({'success': success});

      } catch (error) {
        console.error('Error inserting data:', error);
        sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
      }
  } catch (error) {
      sendBadRequestResponse(res);
  }
});

router.get('/retrieveAllInvenotryData', async(req, res) => {
    try {
        const [rows] = await mysqlLogic.getAllInventoryData();
        res.statusCode(200).send({'success': 1, 'result': rows});
    } catch (error) {
        console.error('Error retrieving data:', error);
        sendInternalServerError(res, errorCode.DATABASE_OPERATION_ERROR);
    }
});

router.delete('/deleteInvenotry/:currentInventoryId',async (req, res) => {
  try{     
      try {
        let success = 0;
        const {currentInventoryId} = req.params;

        if (currentInventoryId === undefined ){
          sendInternalServerError(res, errorCode.DELETE_INVENTORY_UNDEFINED_INVENTORY_ID);
        }
        const isInventoryIdExist = await mysqlLogic.verifyInventoryIdExist(currentInventoryId);

        if (isNaN(parseInt(currentInventoryId)) || !isInventoryIdExist){
          sendInternalServerError(res, errorCode.DELETE_INVENTORY_INVALID_INVENTORY_ID);
        }
        success = mysqlLogic.deleteInventoryObject(currentInventoryId);
        res.status(201).send({'success': success});

      } catch (error) {
        console.error('Error inserting data:', error);
        sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
      }
  } catch (error) {
      sendBadRequestResponse(res);
  }
});
 
module.exports = router;