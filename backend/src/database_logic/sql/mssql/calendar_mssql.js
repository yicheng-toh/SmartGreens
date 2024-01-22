const {createDbConnection} = require("./mssql.js");
const sql = require("mssql");
//reminder
//getAllReminders
async function getAllSchedules(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM Schedule');
    dbConnection.disconnect();
    return queryResult.recordset;
}
//insertReminder
async function insertSchedule(task, datetime, status){
    const dbConnection = await createDbConnection();
    // await dbConnection.execute('INSERT INTO Reminders (Task, Datetime, Status) VALUES (?,?,?)',
    //     [task, datetime, status]);
    const request = await dbConnection.connect();
    await request
        .input('task', sql.VarChar, task)
        .input('datetime', sql.DateTime, datetime)
        .input('status', sql.VarChar, status)
        .query('INSERT INTO Reminders (SheduleTask, Datetime, Status) VALUES (@task, @datetime, @status)');
    dbConnection.disconnect();
    return 1;
}

//alerts
//getAllAlerts
async function getAllAlerts(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM Alert');
    dbConnection.disconnect();
    return queryResult.recordset;
}
//insertAlert
async function insertAlert(issue, datetime, plantBatchId, severity){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    // await dbConnection.execute('INSERT INTO AlertsSent (Action, Datetime, Status, Severity) VALUES (?,?,?,?)',
    //     [action, datetime, status, severity]);
    await request
        .input('action', sql.VarChar, issue)
        .input('datetime', sql.DateTime, datetime)
        .input('plantBatchId', sql.Int, plantBatchId)
        .input('severity', sql.VarChar, severity)
        .query('INSERT INTO Alert (Issue, Datetime, PlantBatchId, Severity) VALUES (@action, @datetime, @plantBatchId, @severity)');
    dbConnection.disconnect();
    return 1;
}

//tasks
//getAllTasks
async function getAllTasks(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM Task');
    dbConnection.disconnect();
    return queryResult.recordset;
}
//insertTask
async function insertTask(action, datetime, status){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    // await dbConnection.execute('INSERT INTO Task (Action, Datetime, Status) VALUES (?,?,?)', 
    //     [action, datetime, status]);
    await request
        .request()
        .input('action', sql.VarChar, action)
        .input('datetime', sql.DateTime, datetime)
        .input('status', sql.VarChar, status)
        .query('INSERT INTO Task (Action, Datetime, Status) VALUES (@action, @datetime, @status)');
    dbConnection.disconnect();
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