const{ DEBUG } = require("../../../env.js");
const {createDbConnection} = require("./mssql.js");
const sql = require("mssql");
//reminder
//getAllReminders
async function getAllSchedules(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM Schedule2 ORDER BY Content ASC;');
    if (DEBUG) console.log("schedules result", queryResult);
    dbConnection.disconnect();
    return queryResult.recordset;
}
//insertReminder
async function insertSchedule(type, content, task, id = null){
    const dbConnection = await createDbConnection();
    // await dbConnection.execute('INSERT INTO Schedule (Task, Datetime, Status) VALUES (?,?,?)',
    //     [task, datetime, status]);
    const request = await dbConnection.connect();
    // await request
    //     .input('description', sql.VarChar, description)
    //     .input('datetime', sql.DateTime, datetime)
    //     .input('status', sql.Bit, !!status)
    //     .query('INSERT INTO Schedule (ScheduleDescription, Datetime, Status) VALUES (@description, @datetime, @status)');
    if(!id){
        await request
            .input('type', sql.VarChar, type)
            .input('content', sql.DateTime, content)
            .input('task', sql.VarChar, task)
            .query('INSERT INTO Schedule2 (Type, Content, Task) VALUES (@type, @content, @task);');
    }else{
        await request
            .input('id', sql.Int, id)
            .input('type', sql.VarChar, type)
            .input('content', sql.DateTime, content)
            .input('task', sql.VarChar, task)
            .query('INSERT INTO Schedule2 (Type, Content, Task, ScheduleId) VALUES (@type, @content, @task, @id);');
    }
    dbConnection.disconnect();
    return 1;
}

//alerts
//getAllAlerts
async function getAllAlerts(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM Alert;');
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
        .query('INSERT INTO Alert (Issue, Datetime, PlantBatchId, Severity) VALUES (@action, @datetime, @plantBatchId, @severity);');
    dbConnection.disconnect();
    return 1;
}

//tasks
//getAllTasks
async function getAllTasks(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM Task;');
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
        .input('action', sql.VarChar, action)
        .input('datetime', sql.DateTime, datetime)
        .input('status', sql.Bit, status)
        .query('INSERT INTO Task (Action, Datetime, Status) VALUES (@action, @datetime, @status);');
    dbConnection.disconnect();
    return 1;
}

async function verifyAlertIdExist(alertId){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    // const request =  dbConnection.connect();
    if (DEBUG) console.log("verifying id....");
    const alertIdList = await request
        .input('alertId', sql.Int, alertId)
        .query('SELECT * FROM Alert WHERE AlertId = @alertId;');
    if (DEBUG) console.log("alert id list is", alertIdList);
    dbConnection.disconnect();
    return alertIdList.recordset.length;
}

async function verifyScheduleIdExist(scheduleId){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    // const request =  dbConnection.connect();
    if (DEBUG) console.log("verifying id....");
    const scheduleIdList = await request
        .input('scheduleId', sql.Int, scheduleId)
        .query('SELECT * FROM Schedule2 WHERE ScheduleId = @scheduleId;');
    if (DEBUG) console.log("schedule id list is", scheduleIdList);
    dbConnection.disconnect();
    return scheduleIdList.recordset.length;
}

async function verifyTaskIdExist(taskId){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    // const request =  dbConnection.connect();
    if (DEBUG) console.log("verifying id....");
    const taskIdList = await request
        .input('taskId', sql.Int, taskId)
        .query('SELECT * FROM Task WHERE TaskId = @taskId;');
    if (DEBUG) console.log("task id list is", taskIdList);
    dbConnection.disconnect();
    return taskIdList.recordset.length;
}

async function deleteAlert(alertId){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    await request
    .input('alertId', sql.Int, alertId)
    .query('DELETE FROM Alert WHERE AlertID = @alertId;');
    dbConnection.disconnect();
    return 1;
}
async function deleteSchedule(scheduleId){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    await request
    .input('scheduleId', sql.Int, scheduleId)
    .query('DELETE FROM Schedule2 WHERE ScheduleID = @scheduleId;');
    dbConnection.disconnect();
    return 1;
}
async function deleteTask(TaskId){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    await request
    .input('taskId', sql.Int, TaskId)
    .query('DELETE FROM Task WHERE TaskID = @taskId;');
    dbConnection.disconnect();
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