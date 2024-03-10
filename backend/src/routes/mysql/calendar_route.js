const { json } = require("express");
const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  sendBadRequestResponse,
  sendInternalServerError,
} = require("../request_error_messages.js");
const mysqlLogic = require("../../database_logic/sql/sql.js");
const {
  convertTime12HourTo24Hour,
  formatDateTimeOutput,
} = require("../../misc_function.js");
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
    if (datetime.includes("T")) {
      datetime.slice(0, 19).replace("T", " ");
    }
    console.log(datetime, issue, severity);

    success = await mysqlLogic.insertAlert(
      issue,
      datetime,
      plantBatchId,
      severity
    );
    // console.log(success);
    if (success) {
      res
        .status(201)
        .json({ success: 1, message: "Data inserted successfully" });
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
 *     summary: Insert a schedule
 *     tags: [Calendar]
 *     description: Endpoint to insert a schedule.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of schedule. Default is 'manual'.
 *                 example: 'manual'
 *               content:
 *                 type: string
 *                 description: Content of the schedule in the format 'DD MMM YYYY HH:MM A'.
 *                 example: "21 Feb 2024 02:15 pm"
 *               task:
 *                 type: string
 *                 description: Task associated with the schedule.
 *                 example: 'example Task'
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/insertSchedule", async (req, res) => {
  try {
    let success = 0;
    let { type, content, task} = req.body;
    if (task === undefined || !task.trim()) {
      sendInternalServerError(res, "Task is invalid.");
      return;
    } else if (content === undefined) {
      sendInternalServerError(res, "Content is invalid");
      return;
    } else if (type === undefined) {
      type = "manual";
      return;
    }
    task = task.trim();
    content = content.trim();
    let contentDate = content.slice(0, -8);
    let contentTime = content.slice(-8);
    console.log("contentDate", contentDate, "contentTime", contentTime);
    processedContentDateTime = new Date(
      contentDate + convertTime12HourTo24Hour(contentTime)
    )
    // processedContentDateTime.setHours(processedContentDateTime.getHours() + 8);

    console.log(task, processedContentDateTime, type);
    success = await mysqlLogic.insertSchedule(
      type,
      processedContentDateTime,
      task
    );
    if (success) {
      res
        .status(201)
        .json({ success: 1, message: "Data inserted successfully" });
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
    } else if (
      status === undefined ||
      !(!isNaN(parseInt(status)) || typeof myVariable === "boolean")
    ) {
      // console.log("status failed");
      sendInternalServerError(res, "Status is invalid.");
      return;
    }
    action = action.trim();
    datetime = datetime.trim();
    status = typeof myVariable !== "boolean" ? parseInt(status) : status;
    if (datetime.includes("T")) {
      datetime.slice(0, 19).replace("T", " ");
    }
    console.log(action, datetime, status);
    success = await mysqlLogic.insertTask(action, datetime, status);
    if (success) {
      res
        .status(201)
        .json({ success: success, message: "Data inserted successfully" });
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
    const rows = await mysqlLogic.getAllAlerts();
    if (rows) {
      res.status(200).json({ success: 1, result: rows });
      return;
    } else {
      res.status(200).json({ success: 1, message: "No sensor data available" });
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
 * /calendar/retrieveSchedules:
 *   get:
 *     summary: Retrieve all schedules
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get("/retrieveSchedules", async (req, res) => {
  try {
    // const [rows] = await mysqlLogic.getAllSensorData();
    const rows = await mysqlLogic.getAllSchedules();
    console.log("retrieve schedules rows", rows);
    rows.forEach((item) => {
      item.content = item.Content ? formatDateTimeOutput(item.Content): formatDateTimeOutput(item.content);
    });
    if (rows) {
      res.status(200).json({ success: 1, result: rows });
      return;
    } else {
      res.json({ success: 1, message: "No sensor data available" });
      return;
    }
  } catch (error) {
    sendInternalServerError(res, error);
    console.log("Error retrieving data:", error);
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
    const rows = await mysqlLogic.getAllTasks();
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

/**
 * @swagger
 * /calendar/deleteAlert/{alertId}:
 *   delete:
 *     summary: Delete an alert by ID
 *     tags: [Calendar]
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         description: ID of the alert to delete
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       201:
 *         description: Alert deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   description: Indicates whether the deletion was successful
 */
router.delete("/deleteAlert/:alertId", async (req, res) => {
  // try{
  try {
    let success = 0;
    const { alertId } = req.params;
    if (isNaN(parseInt(alertId))) {
      sendInternalServerError(res, "Alert id is not an integer");
      return;
    }
    const isAlertIdExist = await mysqlLogic.verifyAlertIdExist(alertId);
    if (!isAlertIdExist) {
      console.log("isAlertIdExist", isAlertIdExist);
      sendInternalServerError(res, "Alert Id does not exist.");
      return;
    }

    success = await mysqlLogic.deleteAlert(alertId);
    res.status(201).json({ success: success });
    return;
  } catch (error) {
    console.log("Error inserting data:", error);
    // sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
    sendInternalServerError(res, error);
    return;
  }
});

/**
 * @swagger
 * /calendar/deleteSchedule/{scheduleId}:
 *   delete:
 *     summary: Delete a schedule by ID
 *     tags: [Calendar]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         description: ID of the schedule to delete
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       201:
 *         description: Schedule deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   description: Indicates whether the deletion was successful
 */
router.delete("/deleteSchedule/:scheduleId", async (req, res) => {
  // try{
  try {
    let success = 0;
    const { scheduleId } = req.params;
    if (isNaN(parseInt(scheduleId))) {
      sendInternalServerError(res, "Schedule Id given is not an integer.");
      return;
    }
    const isScheduleIdExist = await mysqlLogic.verifyScheduleIdExist(
      scheduleId
    );
    if (!isScheduleIdExist) {
      console.log("isScheduleIdExist", isScheduleIdExist);
      sendInternalServerError(res, "Schedule Id does not exist.");
      return;
    }

    success = await mysqlLogic.deleteSchedule(scheduleId);
    res.status(201).json({ success: success });
    return;
  } catch (error) {
    console.log("Error inserting data:", error);
    // sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
    sendInternalServerError(res, error);
    return;
  }
});

/**
 * @swagger
 * /calendar/deleteTask/{taskId}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Calendar]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: ID of the task to delete
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       201:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: integer
 *                   description: Indicates whether the deletion was successful
 */
router.delete("/deleteTask/:taskId", async (req, res) => {
  // try{
  try {
    let success = 0;
    const { taskId } = req.params;
    if (isNaN(parseInt(taskId))) {
      sendInternalServerError(res, "Invalid Task Id.");
      return;
    }
    const isTaskIdExist = await mysqlLogic.verifyTaskIdExist(taskId);
    if (!isTaskIdExist) {
      console.log("isTaskIdExist", isTaskIdExist);
      sendInternalServerError(res, "Task Id does not exist.");
      return;
    }

    success = await mysqlLogic.deleteTask(taskId);
    res.status(201).json({ success: success });
    return;
  } catch (error) {
    console.log("Error inserting data:", error);
    // sendInternalServerError(res, error.DATABASE_OPERATION_ERROR);
    sendInternalServerError(res, error);
    return;
  }
});

module.exports = router;
