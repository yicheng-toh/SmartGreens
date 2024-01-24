/*
related to 
task completed.
action
reminder
*/
const { json } = require("express");
const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  sendBadRequestResponse,
  sendInternalServerError,
} = require("../request_error_messages.js");
const mysqlLogic = require("../../database_logic/sql/sql.js");

//This route is not done yet.
router.post("/insertAlert", async (req, res) => {
    try {
      let success = 0;
      let { issue, datetime, plantBatchId, severity } = req.body;

      if (issue === undefined || !issue.trim()) {
        sendInternalServerError(res);
        return;
      } else if (datetime === undefined || isNaN(Date.parse(datetime.trim()))) {
        // console.log(Date(datetime.trim()));
        sendInternalServerError(res);
        return;
      } else if (plantBatchId === undefined) {
        sendInternalServerError(res);
        return;
      } else if (severity === undefined) {
        sendInternalServerError(res);
        return;
      }
      datetime = datetime.trim();
      issue = issue.trim();
      severity = severity.trim();

      success = await mysqlLogic.insertAlert(
        issue,
        datetime,
        plantBatchId,
        severity
      );
      // console.log(success);
      if (success) {
        res.status(201).send("Data inserted successfully");
        return;
      } else {
        sendInternalServerError(res);
        return;
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res);
      return;
    }
});

//This route is not done yet.
router.post("/insertSchedule", async (req, res) => {
    try {
			let success = 0;
      let { task, datetime, status } = req.body;
      if (task === undefined || !task.trim()) {
        sendInternalServerError(res);
        return;
      } else if (datetime === undefined || isNaN(Date.parse(datetime.trim()))) {
        sendInternalServerError(res);
        return;
      } else if (status === undefined || isNaN(parseInt(status))) {
        sendInternalServerError(res);
        return;
      }
			task = task.trim();
			datetime = datetime.trim();
			status = parseInt(status);
      success = await mysqlLogic.insertReminder(task, datetime, status);
      if (success) {
        res.status(201).send("Data inserted successfully");
        return;
      } else {
        sendInternalServerError(res);
        return;
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res);
      return;
    }
});

//This route is not done yet
router.post("/insertTask", async (req, res) => {
    try {
			let success = 0;
      let { action, datetime, status } = req.body;
      if (action === undefined || !action.trim()) {
        sendInternalServerError(res);
        return;
      } else if (datetime === undefined || isNaN(Date.parse(datetime.trim()))) {
        sendInternalServerError(res);
        return;
      } else if (status === undefined || !(!isNaN(parseInt(status)) || typeof myVariable === 'boolean')) {
				// console.log("status failed");
        sendInternalServerError(res);
        return;
      }
			action = action.trim();
			datetime = datetime.trim();
			status = typeof myVariable !== 'boolean' ? parseInt(status): status;
      success = await mysqlLogic.insertTask(action, datetime, status);
      if (success) {
        res.status(201).send("Data inserted successfully");
        return;
      } else {
        sendInternalServerError(res);
        return;
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res);
      return;
    }
});

router.get("/retrieveAlerts", async (req, res) => {
  try {
    // const [rows] = await mysqlLogic.getAllSensorData();
    const [rows] = await mysqlLogic.getAllAlerts();
    if (rows) {
      res.status(200).json(rows);
      return;
    } else {
      res.json({ message: "No sensor data available" });
      return;
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res);
    return;
  }
});

router.get("/retrieveReminders", async (req, res) => {
  try {
    // const [rows] = await mysqlLogic.getAllSensorData();
    const [rows] = await mysqlLogic.getAllReminders();
    if (rows) {
      res.status(200).json(rows);
      return;
    } else {
      res.json({ message: "No sensor data available" });
      return;
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res);
    return;
  }
});

router.get("/retrieveTasks", async (req, res) => {
  try {
    const [rows] = await mysqlLogic.getAllTasks();
    if (rows) {
      res.status(200).json(rows);
      return;
    } else {
      res.json({ message: "No sensor data available" });
      return;
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res);
    return;
  }
});

module.exports = router;
