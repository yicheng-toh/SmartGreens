const {createDbConnection} = require("./mssql.js");
const sql = require("mssql");
//reminder
//getAllReminders
async function getAllReminders(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM Reminders');
    dbConnection.disconnect();
    return queryResult.recordset;
}
//insertReminder
async function insertReminder(task, datetime, status){
    const dbConnection = await createDbConnection();
    // await dbConnection.execute('INSERT INTO Reminders (Task, Datetime, Status) VALUES (?,?,?)',
    //     [task, datetime, status]);
    const request = await dbConnection.connect();
    await request
        .input('task', dbConnection.VarChar, task)
        .input('datetime', dbConnection.DateTime, datetime)
        .input('status', dbConnection.VarChar, status)
        .query('INSERT INTO Reminders (Task, Datetime, Status) VALUES (@task, @datetime, @status)');
    dbConnection.disconnect();
    return 1;
}

//alerts
//getAllAlerts
async function getAllAlerts(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM AlertsSent');
    dbConnection.disconnect();
    return queryResult.recordset;
}
//insertAlert
async function insertAlert(action, datetime, status, severity){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    // await dbConnection.execute('INSERT INTO AlertsSent (Action, Datetime, Status, Severity) VALUES (?,?,?,?)',
    //     [action, datetime, status, severity]);
    await request
        .input('action', dbConnection.VarChar, action)
        .input('datetime', dbConnection.DateTime, datetime)
        .input('status', dbConnection.VarChar, status)
        .input('severity', dbConnection.VarChar, severity)
        .query('INSERT INTO AlertsSent (Action, Datetime, Status, Severity) VALUES (@action, @datetime, @status, @severity)');
    dbConnection.disconnect();
    return 1;
}

//tasks
//getAllTasks
async function getAllTasks(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM Tasks');
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
        .input('action', dbConnection.VarChar, action)
        .input('datetime', dbConnection.DateTime, datetime)
        .input('status', dbConnection.VarChar, status)
        .query('INSERT INTO Tasks (Action, Datetime, Status) VALUES (@action, @datetime, @status)');
    dbConnection.disconnect();
    return 1;
}


module.exports = {
    getAllAlerts,
    getAllReminders,
    getAllTasks,
    insertAlert,
    insertReminder,
    insertTask,
};