const { dbConnection } = require("./mysql.js");

//reminder
//getAllReminders
async function getAllSchedules() {
  queryResult = await dbConnection.promise().query("SELECT * FROM Schedule");
  return queryResult[0];
}
//insertReminder
async function insertSchedule(description, datetime, status) {
  try {
	await dbConnection.execute(
	  "INSERT INTO Schedule (ScheduleDescription, Datetime, Status) VALUES (?,?,?)",
	  [description, datetime, status]
	);
	
  } catch (error) {
	console.log("Error in getAllAlerts:", error);
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
	  [issue, datetime, plantBatchId, severity], (error) => {
		if (error) {
		  console.error("Error in insertAlert:", error);
		  throw error; // Failure
		
		}}
	);
	
  } catch (error) {
	console.log("Error in getAllAlerts:", error);
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
	console.log("Error in getAllAlerts:", error);
	throw error; // Optionally rethrow the error
  }
}

module.exports = {
  getAllAlerts,
  getAllReminders: getAllSchedules,
  getAllTasks,
  insertAlert,
  insertReminder: insertSchedule,
  insertTask,
};
