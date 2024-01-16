const {dbConnection} = require("./mysql.js");

//insert data into the database.
//TODO this is to be updated to phase 2 code.
async function insertSensorValues(dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness){
    await dbConnection.execute('INSERT INTO SensorReadings (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (?, ?, ?, ?, ?, ?)',
        [dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness]);
    return 1;
}

//retrieve all data regardless of the microcontroller and batch id.
async function getAllSensorData(){
    const queryResult = await dbConnection.promise().query('SELECT * FROM SensorReadings');
    return queryResult;
}

module.exports = {
    insertSensorValues,
    getAllSensorData,
}