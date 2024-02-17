const { createDbConnection } = require("./mssql.js");
const sql = require("mssql");

//insert data into the database.
//TODO this is to be updated to phase 2 code.
async function getPlantBatchIdGivenMicrocontrollerPrefix(
  microcontrollerIdPrefix
) {
  const dbConnection = await createDbConnection();
  let request = await dbConnection.connect();
  const queryResult = await request.input(
    "microcontrollerId",
    sql.VarChar(20),
    microcontrollerIdPrefix
  ).query(`
      SELECT PlantBatchId
      FROM MicrocontrollerPlantBatchPair
      WHERE MicrocontrollerId = @microcontrollerId
    `);
  //   console.log("rows is rows", rows);
  //   let queryResult = rows;
  console.log("qyuery resutl ist", queryResult.recordset);
//   console.log(queryResult[0]);
  if (queryResult.recordset.length) {
    console.log(queryResult);
    return queryResult.recordset[0];
  }
  return -1;
}

async function insertSensorValuesSuffix1(
  dateTime,
  microcontrollerIdPrefix, microcontrollerIdSuffix,
  plantBatchId,
  temperature,
  humidity,
  brightness
) {
  const shouldUpdate = await shouldUpdateExisingSensorReadings(microcontrollerIdPrefix, microcontrollerIdSuffix);
  console.log("Insert data suffix1 shouldUpdate:", shouldUpdate);
  const dbConnection = await createDbConnection();
  let request = await dbConnection.connect();
  if (shouldUpdate) {
    await request
        .input('dateTime', sql.DateTime, dateTime)
        .input('microcontrollerId', sql.VarChar(20), microcontrollerIdPrefix)
        .input('plantBatchId', sql.Int, plantBatchId)
        .input('temperature', sql.Float, temperature)
        .input('humidity', sql.Float, humidity)
        .input('brightness', sql.Float, brightness)
        .query(`
          UPDATE SensorReadings
          SET
            Temperature = @temperature,
            Humidity = @humidity,
            Brightness = @brightness
          WHERE
            MicrocontrollerId = @microcontrollerId AND
            PlantBatchId = @plantBatchId AND
            DateTime = (
              SELECT MAX(DateTime)
              FROM (SELECT * FROM SensorReadings) AS temp
              WHERE MicrocontrollerId = @microcontrollerId
            )
        `);
  }else{

    await request
        .input("dateTime", sql.DateTime, dateTime)
        .input("microcontrollerId", sql.VarChar(20), microcontrollerIdPrefix)
        .input("plantBatchId", sql.Int, plantBatchId)
        .input("temperature", sql.Float, temperature)
        .input("humidity", sql.Float, humidity)
        .input("brightness", sql.Float, brightness);
    // request = await dbConnection.connect();
    await request.query(
        "INSERT INTO SensorReadings (DateTime, MicrocontrollerId, PlantBatchId, Temperature, Humidity, Brightness) VALUES (@dateTime, @microcontrollerId, @plantBatchId, @temperature, @humidity, @brightness)"
    );
  }
  await dbConnection.disconnect();
  return 1;
}

async function insertSensorValuesSuffix2(
  dateTime,
  microcontrollerIdPrefix, microcontrollerIdSuffix,
  plantBatchId,
  pH, CO2, EC, TDS
) {
  const shouldUpdate = await shouldUpdateExisingSensorReadings(microcontrollerIdPrefix, microcontrollerIdSuffix);
  const dbConnection = await createDbConnection();
  let request = await dbConnection.connect();
  if (shouldUpdate) {
    await request
        .input('dateTime', sql.DateTime, dateTime)
        .input('microcontrollerId', sql.VarChar(20), microcontrollerIdPrefix)
        .input('plantBatchId', sql.Int, plantBatchId)
        .input('pH', sql.Float, pH)
        .input('CO2', sql.Float, CO2)
        .input('EC', sql.Float, EC)
        .input('TDS', sql.Float, TDS)
        .query(`
          UPDATE SensorReadings
          SET
            pH = @pH,
            CO2 = @CO2,
            EC = @EC,
            TDS = @TDS
          WHERE
            MicrocontrollerId = @microcontrollerId AND
            PlantBatchId = @plantBatchId AND
            DateTime = (
              SELECT MAX(DateTime)
              FROM (SELECT * FROM SensorReadings) AS temp
              WHERE MicrocontrollerId = @microcontrollerId
            )
        `);
  }else{

    await request
        .input("dateTime", sql.DateTime, dateTime)
        .input("microcontrollerId", sql.VarChar(20), microcontrollerIdPrefix)
        .input("plantBatchId", sql.Int, plantBatchId)
        .input('pH', sql.Float, pH)
        .input('CO2', sql.Float, CO2)
        .input('EC', sql.Float, EC)
        .input('TDS', sql.Float, TDS)
        .query(`
          INSERT INTO SensorReadings (DateTime, MicrocontrollerId, PlantBatchId, pH, CO2, EC, TDS)
          VALUES (@dateTime, @microcontrollerId, @plantBatchId, @pH, @CO2, @EC, @TDS)
        `);
  }
  await dbConnection.disconnect();
  return 1;
}

//retrieve all data regardless of the microcontroller and batch id.
async function getAllSensorData() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  const queryResult = await request.query("SELECT * FROM SensorReadings");
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function shouldUpdateExisingSensorReadings(micrcontrolleridPrefix, microcontrollerIdSuffix){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    let shouldUpdate = false;
    const getLatestMicroControllerSensorReadingQuery = `
    SELECT *
    FROM SensorReadings
    WHERE MicrocontrollerID = @microcontrollerId
        AND Datetime >= DATEADD(MINUTE, -@minutes, GETDATE())
    ORDER BY Datetime DESC
    OFFSET 0 ROWS
    FETCH NEXT 1 ROWS ONLY;
    `;
    const minutes = 5;
    const queryResult = await request
      .input('microcontrollerId', sql.VarChar(20), micrcontrolleridPrefix)
      .input('minutes', sql.Int, minutes)
      .query(getLatestMicroControllerSensorReadingQuery);
    await dbConnection.disconnect();
    console.log("should uupdate funtion recrodset",queryResult.recordset)
    if (!queryResult.recordset.length){
        return shouldUpdate;
    }
    let rows = queryResult.recordset;
    if (!rows){
        return shouldUpdate;
    }
    if (microcontrollerIdSuffix == 1 ){
        if (!rows.temperature){
            shouldUpdate = true;
        }
        console.log("rows.temperature is ", rows.temperature);

    }else if (microcontrollerIdSuffix == 2){
        if (!rows.pH){
            shouldUpdate = true;
        }
        console.log("rows.pH is ", rows.pH);
    }
    return shouldUpdate;
}

module.exports = {
  getAllSensorData,
  getPlantBatchIdGivenMicrocontrollerPrefix,
  insertSensorValuesSuffix1,
  insertSensorValuesSuffix2,
};
