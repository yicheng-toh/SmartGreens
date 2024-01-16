const {dbConnection} = require("./mysql.js");

//reminder
//getAllReminders
async function getAllReminders(){
    queryResult = await dbConnection.promise().query('SELECT * FROM Reminders');
    return queryResult;
}
//insertReminder
async function insertReminder(task, datetime, status){
    await dbConnection.execute('INSERT INTO Reminders (Task, Datetime, Status) VALUES (?,?,?)',
        [task, datetime, status]);
    return 1;
}

//alerts
//getAllAlerts
async function getAllAlerts(){
    queryResult = await dbConnection.promise().query('SELECT * FROM AlertsSent');
    return queryResult;
}
//insertAlert
async function insertAlert(action, datetime, status, severity){
    await dbConnection.execute('INSERT INTO AlertsSent (Action, Datetime, Status, Severity) VALUES (?,?,?,?)',
        [action, datetime, status, severity]);

    return 1;
}

//tasks
//getAllTasks
async function getAllTasks(){
    queryResult = await dbConnection.promise().query('SELECT * FROM Tasks');
    return queryResult;
}
//insertTask
async function insertTask(action, datetime, status){
    await dbConnection.execute('INSERT INTO Task (Action, Datetime, Status) VALUES (?,?,?)', 
        [action, datetime, status]);
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