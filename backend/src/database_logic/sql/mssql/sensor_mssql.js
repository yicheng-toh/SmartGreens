const {createDbConnection} = require("./mssql.js");

//insert data into the database.
//TODO this is to be updated to phase 2 code.
async function insertSensorValues(dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness){
    // await dbConnection.execute('INSERT INTO SensorReadings (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (?, ?, ?, ?, ?, ?)',
    //     [dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness]);
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    await request
        .input('dateTime', dbConnection.DateTime, dateTime)
        .input('microcontrollerId', dbConnection.Int, microcontrollerId)
        .input('plantBatch', dbConnection.Int, plantBatch)
        .input('temperature', dbConnection.Float, temperature)
        .input('humidity', dbConnection.Float, humidity)
        .input('brightness', dbConnection.Float, brightness)
        .query('INSERT INTO SensorReadings (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (@dateTime, @microcontrollerId, @plantBatch, @temperature, @humidity, @brightness)');
    dbConnection.disconnect()
    return 1;
}

//retrieve all data regardless of the microcontroller and batch id.
async function getAllSensorData(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect()
    const queryResult = await request.query('SELECT * FROM SensorReadings');
    dbConnection.disconnect()
    return queryResult;
}

module.exports = {
    insertSensorValues,
    getAllSensorData,
}