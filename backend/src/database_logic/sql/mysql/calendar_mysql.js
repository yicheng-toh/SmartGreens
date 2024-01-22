const {dbConnection} = require("./mysql.js");

//reminder
//getAllReminders
async function getAllSchedules(){
    queryResult = await dbConnection.promise().query('SELECT * FROM Schedule');
    return queryResult[0];
}
//insertReminder
async function insertSchedule(task, datetime, status){
    await dbConnection.execute('INSERT INTO Reminders (Task, Datetime, Status) VALUES (?,?,?)',
        [task, datetime, status]);
    return 1;
}

//alerts
//getAllAlerts
async function getAllAlerts(){
    queryResult = await dbConnection.promise().query('SELECT * FROM Alert');
    return queryResult[0];
}
//insertAlert
async function insertAlert(issue, datetime, plantBatchId, severity){
    await dbConnection.execute('INSERT INTO Alert (Issue, Datetime, PlantBatchId, Severity) VALUES (?,?,?,?)',
        [issue, datetime, plantBatchId, severity]);

    return 1;
}

//tasks
//getAllTasks
async function getAllTasks(){
    queryResult = await dbConnection.promise().query('SELECT * FROM Task');
    return queryResult[0];
}
//insertTask
async function insertTask(action, datetime, status){
    await dbConnection.execute('INSERT INTO Task (Action, Datetime, Status) VALUES (?,?,?)', 
        [action, datetime, status]);
    return 1;
}


module.exports = {
    getAllAlerts,
    getAllReminders: getAllSchedules,
    getAllTasks,
    insertAlert,
    insertReminder: insertSchedule,
    insertTask,
};