const {createDbConnection} = require("./mssql.js");
const sql = require("mssql");

//insert data into the database.
//TODO this is to be updated to phase 2 code.
async function insertSensorValues(dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness){
    // await dbConnection.execute('INSERT INTO SensorReadings (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (?, ?, ?, ?, ?, ?)',
    //     [dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness]);
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    await request
        .input('dateTime', sql.DateTime, dateTime)
        .input('microcontrollerId', sql.Int, microcontrollerId)
        .input('plantBatchId', sql.Int, plantBatch)
        .input('temperature', sql.Float, temperature)
        .input('humidity', sql.Float, humidity)
        .input('brightness', sql.Float, brightness)
        .query('INSERT INTO SensorReadings (DateTime, MicrocontrollerId, PlantBatchId, Temperature, Humidity, Brightness) VALUES (@dateTime, @microcontrollerId, @plantBatchId, @temperature, @humidity, @brightness)');
    await dbConnection.disconnect()
    return 1;
}

//retrieve all data regardless of the microcontroller and batch id.
async function getAllSensorData(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect()
    const queryResult = await request.query('SELECT * FROM SensorReadings');
    await dbConnection.disconnect()
    return queryResult.recordset;
}

module.exports = {
    insertSensorValues,
    getAllSensorData,
}