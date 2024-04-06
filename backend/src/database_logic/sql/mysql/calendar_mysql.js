const{ DEBUG } = require("../../../env.js");
const { dbConnection } = require("./mysql.js");

//reminder
//getAllReminders
async function getAllSchedules() {
  queryResult = await dbConnection.promise().query("SELECT * FROM Schedule2");
  if (DEBUG) console.log(queryResult[0]);
  return queryResult[0];
}
//insertReminder
async function insertSchedule(type, content, task, id = null) {
  try {
    // await dbConnection.execute(
    //   "INSERT INTO Schedule (ScheduleDescription, Datetime, Status) VALUES (?,?,?)",
    //   [description, datetime, status]
    // );
    if (!id) {
      await dbConnection.execute(
        "INSERT INTO Schedule2 (type, content, task) VALUES (?,?,?)",
        [type, content, task]
      );
    } else {
      await dbConnection.execute(
        "INSERT INTO Schedule2 (type, content, task, ScheduleId) VALUES (?,?,?,?)",
        [type, content, task, id]
      );
    }
  } catch (error) {
    if (DEBUG) console.log("Error in getAllAlerts:", error);
    throw error; // Optionally rethrow the error
  }
  return 1;
}

//alerts
//getAllAlerts
async function getAllAlerts() {
  queryResult = await dbConnection.promise().query("SELECT * FROM Alert");
  return queryResult[0];
}
//insertAlert
async function insertAlert(issue, datetime, plantBatchId, severity) {
  try {
    await dbConnection.execute(
      "INSERT INTO Alert (Issue, Datetime, PlantBatchId, Severity) VALUES (?,?,?,?)",
      [issue, datetime, plantBatchId, severity],
      (error) => {
        if (error) {
          console.error("Error in insertAlert:", error);
          throw error; // Failure
        }
      }
    );
  } catch (error) {
    if (DEBUG) console.log("Error in getAllAlerts:", error);
    throw error; // Optionally rethrow the error
    // return 0;
  }
  return 1;
}

//tasks
//getAllTasks
async function getAllTasks() {
  queryResult = await dbConnection.promise().query("SELECT * FROM Task");
  return queryResult[0];
}
//insertTask
async function insertTask(action, datetime, status) {
  try {
    await dbConnection.execute(
      "INSERT INTO Task (Action, Datetime, Status) VALUES (?,?,?)",
      [action, datetime, status]
    );
    return 1;
  } catch (error) {
    if (DEBUG) console.log("Error in getAllAlerts:", error);
    throw error; // Optionally rethrow the error
  }
}

async function verifyAlertIdExist(alertId) {
  const alertIdList = await dbConnection
    .promise()
    .query("SELECT * FROM Alert WHERE AlertId = ?", alertId);
  // if (DEBUG) console.log(inventoryIdList);
  return alertIdList[0].length;
}

async function verifyScheduleIdExist(scheduleId) {
  const scheduleIdList = await dbConnection
    .promise()
    .query("SELECT * FROM Schedule2 WHERE ScheduleId = ?", scheduleId);
  // if (DEBUG) console.log(inventoryIdList);
  return scheduleIdList[0].length;
}

async function verifyTaskIdExist(taskId) {
  const taskIdList = await dbConnection
    .promise()
    .query("SELECT * FROM Task WHERE TaskId = ?", taskId);
  // if (DEBUG) console.log(inventoryIdList);
  return taskIdList[0].length;
}

async function deleteAlert(alertId) {
  await dbConnection.execute("DELETE FROM Alert WHERE AlertId = ?", [alertId]);
  return 1;
}

async function deleteSchedule(scheduleId) {
  await dbConnection.execute("DELETE FROM Schedule2 WHERE ScheduleId = ?", [
    scheduleId,
  ]);
  return 1;
}

async function deleteTask(taskId) {
  await dbConnection.execute("DELETE FROM Task WHERE TaskId = ?", [taskId]);
  return 1;
}

module.exports = {
  getAllAlerts,
  getAllSchedules,
  getAllTasks,
  insertAlert,
  insertSchedule,
  insertTask,
  verifyAlertIdExist,
  verifyScheduleIdExist,
  verifyTaskIdExist,
  deleteAlert,
  deleteSchedule,
  deleteTask,
};
