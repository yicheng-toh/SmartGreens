/*
related to 
task completed.
action
reminder
*/
const { json } = require("express");
const express = require("express");
const router = express.Router({mergeParams: true});
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")

//This route is not done yet.
router.post('/insertAlert', async (req, res) => {
    try{     
        try {
          const {action, datetime, status, severity} = res.body;
          if(action === undefined){
            sendInternalServerError(res);
          }else if(datetime === undefined){
            sendInternalServerError(res);
          }else if (status === undefined){
            sendInternalServerError(res);
          }else if (severity === undefined){
            sendInternalServerError(res);
          }

          const success = await mysqlLogic.insertAlert(action, datetime, status, severity);
          if(success){
            res.status(201).send('Data inserted successfully');
          }else{
            sendInternalServerError(res);
          }
        } catch (error) {
          console.error('Error inserting data:', error);
          sendInternalServerError(res);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});

//This route is not done yet.
router.post('/insertReminder', async (req, res) => {
    try{     
        try {
          const {task, datetime, status} = res.body;
          if(task === undefined){
            sendInternalServerError(res);
          }else if(datetime === undefined){
            sendInternalServerError(res);
          }else if (status === undefined){
            sendInternalServerError(res);
          }
          const success = await mysqlLogic.insertReminder(task, datetime, status);
          if(success){
            res.status(201).send('Data inserted successfully');
          }else{
            sendInternalServerError(res);
          }
        } catch (error) {
          console.error('Error inserting data:', error);
          sendInternalServerError(res);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});

//This route is not done yet
router.post('/insertTask', async (req, res) => {
    try{     
        try {
          const {action, datetime, status} = res.body;
          if(action === undefined){
            sendInternalServerError(res);
          }else if(datetime === undefined){
            sendInternalServerError(res);
          }else if(status === undefined){
            sendInternalServerError(res);
          }
          const success = await mysqlLogic.insertTask(action, datetime, status);
          if(success){
            res.status(201).send('Data inserted successfully');
          }else{
            sendInternalServerError(res);
          }
        } catch (error) {
          console.error('Error inserting data:', error);
          sendInternalServerError(res);
        }
    } catch (error) {
        sendBadRequestResponse(res);
    }
});

router.get('/retrieveAlerts', async(req, res) => {
    try {
        // const [rows] = await mysqlLogic.getAllSensorData();
        const [rows]  = await mysqlLogic.getAllAlerts();
        if (rows) {
          res.status(200).json(rows);
        } else {
          res.json({ message: 'No sensor data available' });
        }
    } catch (error) {
        console.error('Error retrieving data:', error);
        sendInternalServerError(res);
    }
});


router.get('/retrieveReminders', async(req, res) => {
    try {
        // const [rows] = await mysqlLogic.getAllSensorData();
        const [rows]  = await mysqlLogic.getAllReminders();
        if (rows) {
          res.status(200).json(rows);
        } else {
          res.json({ message: 'No sensor data available' });
        }
    } catch (error) {
        console.error('Error retrieving data:', error);
        sendInternalServerError(res);
    }
});


router.get('/retrieveTasks', async(req, res) => {
    try {
        const [rows]  = await mysqlLogic.getAllTasks();
        if (rows) {
          res.status(200).json(rows);
        } else {
          res.json({ message: 'No sensor data available' });
        }
    } catch (error) {
        console.error('Error retrieving data:', error);
        sendInternalServerError(res);
    }
});

module.exports = router;