const { json } = require("express");
const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  sendBadRequestResponse,
  sendInternalServerError,
} = require("../request_error_messages.js");
const mysqlLogic = require("../../database_logic/sql/sql.js");
/**
 * @swagger
 * tags:
 *   name: Calendar
 *   description: Calendar operations
 */

/**
 * @swagger
 * /calendar/insertAlert:
 *   post:
 *     summary: Insert a new alert
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               issue:
 *                 type: string
 *               datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-22 12:00:00"
 *               plantBatchId:
 *                 type: integer
 *               severity:
 *                 type: string
 *                 enum:
 *                  - high
 *                  - medium
 *                  - low
 *                 example: 'high'
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/insertAlert", async (req, res) => {
    try {
      let success = 0;
      let { issue, datetime, plantBatchId, severity } = req.body;

      if (issue === undefined || !issue.trim()) {
        sendInternalServerError(res, "Issues is invalid.");
        return;
      } else if (datetime === undefined || isNaN(Date.parse(datetime.trim()))) {
        // console.log(Date(datetime.trim()));
        sendInternalServerError(res, "Datetime is invalid.");
        return;
      } else if (plantBatchId === undefined) {
        sendInternalServerError(res, "Plant Batch Id is invalid.");
        return;
      } else if (severity === undefined) {
        sendInternalServerError(res, "Severity is invalid.");
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
        res.status(201).json({sucess: 1, message:"Data inserted successfully"});
        return;
      } else {
        console.log("Insertion failed.");
        sendInternalServerError(res, "Data insertion failed.");
        return;
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res, error);
      return;
    }
});

/**
 * @swagger
 * /calendar/insertSchedule:
 *   post:
 *     summary: Insert a new schedule
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *               datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-22 12:00:00"
 *               status:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

//This route is not done yet.
router.post("/insertSchedule", async (req, res) => {
    try {
			let success = 0;
      let { task, datetime, status } = req.body;
      if (task === undefined || !task.trim()) {
        sendInternalServerError(res, "Task is invalid.");
        return;
      } else if (datetime === undefined || isNaN(Date.parse(datetime.trim()))) {
        sendInternalServerError(res, "Date time is invalid");
        return;
      } else if (status === undefined || isNaN(parseInt(status))) {
        sendInternalServerError(res, "Status is invalid.");
        return;
      }
			task = task.trim();
			datetime = datetime.trim();
			status = parseInt(status);
      success = await mysqlLogic.insertReminder(task, datetime, status);
      if (success) {
        res.status(201).json({sucess: 1, message:"Data inserted successfully"});
        return;
      } else {
        sendInternalServerError(res, "Data insertion failed.");
        return;
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res, error);
      return;
    }
});

/**
 * @swagger
 * /calendar/insertTask:
 *   post:
 *     summary: Insert a new task
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *               datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-22 12:00:00"
 *               status:
 *                 oneOf:
 *                    - type: integer
 *                    - type: boolean
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
//This route is not done yet
router.post("/insertTask", async (req, res) => {
    try {
			let success = 0;
      let { action, datetime, status } = req.body;
      if (action === undefined || !action.trim()) {
        sendInternalServerError(res, "Action is Invalid.");
        return;
      } else if (datetime === undefined || isNaN(Date.parse(datetime.trim()))) {
        sendInternalServerError(res, "Date time is invalid.");
        return;
      } else if (status === undefined || !(!isNaN(parseInt(status)) || typeof myVariable === 'boolean')) {
				// console.log("status failed");
        sendInternalServerError(res, "Status is invalid.");
        return;
      }
			action = action.trim();
			datetime = datetime.trim();
			status = typeof myVariable !== 'boolean' ? parseInt(status): status;
      success = await mysqlLogic.insertTask(action, datetime, status);
      if (success) {
        res.status(201).json({success: success, message:"Data inserted successfully"});
        return;
      } else {
        sendInternalServerError(res, "Data insertion failed.");
        return;
      }
    } catch (error) {
      console.log("Error inserting data:", error);
      sendInternalServerError(res, error);
      return;
    }
});

/**
 * @swagger
 * /calendar/retrieveAlerts:
 *   get:
 *     summary: Retrieve all alerts
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get("/retrieveAlerts", async (req, res) => {
  try {
    // const [rows] = await mysqlLogic.getAllSensorData();
    const [rows] = await mysqlLogic.getAllAlerts();
    if (rows) {
      res.status(200).json({success:1, result: rows});
      return;
    } else {
      res.status(200).json({success:1, message: "No sensor data available" });
      return;
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
    return;
  }
});

/**
 * @swagger
 * /calendar/retrieveReminders:
 *   get:
 *     summary: Retrieve all reminders
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get("/retrieveReminders", async (req, res) => {
  try {
    // const [rows] = await mysqlLogic.getAllSensorData();
    const [rows] = await mysqlLogic.getAllReminders();
    if (rows) {
      res.status(200).json({success: 1,result: rows});
      return;
    } else {
      res.json({ success: 1,message: "No sensor data available" });
      return;
    }
  } catch (error) {
    console.log("Error retrieving data:", error);
    sendInternalServerError(res, error);
    return;
  }
});

/**
 * @swagger
 * /calendar/retrieveTasks:
 *   get:
 *     summary: Retrieve all tasks
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
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
    sendInternalServerError(res, error);
    return;
  }
});

module.exports = router;
