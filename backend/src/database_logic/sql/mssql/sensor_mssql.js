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
    console.log(queryResult.recordset);
    console.log(queryResult.recordset[0]);
    console.log(queryResult.recordset[0].PlantBatchId);
    return queryResult.recordset[0].PlantBatchId;
  }
  // return -1;
  //to edit it back next time
  return 1;
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
  // const queryResult = await request.query("SELECT * FROM SensorReadings");
  const sqlQuery = `
  SELECT 
      sr.Datetime,
      sr.MicrocontrollerID,
      sr.PlantBatchId,
      pi.PlantName,
      sr.Temperature,
      sr.Humidity,
      sr.Brightness,
      sr.pH,
      sr.CO2,
      sr.EC,
      sr.TDS,
      pb.PlantId,
      psi.Temperature_min,
      psi.Temperature_max,
      psi.Temperature_optimal,
      psi.Humidity_min,
      psi.Humidity_max,
      psi.Humidity_optimal,
      psi.Brightness_min,
      psi.Brightness_max,
      psi.Brightness_optimal,
      psi.pH_min,
      psi.pH_max,
      psi.pH_optimal,
      psi.CO2_min,
      psi.CO2_max,
      psi.CO2_optimal,
      psi.EC_min,
      psi.EC_max,
      psi.EC_optimal,
      psi.TDS_min,
      psi.TDS_max,
      psi.TDS_optimal
  FROM 
      SensorReadings sr
  LEFT JOIN 
      PlantBatch pb ON sr.PlantBatchId = pb.PlantBatchId
  LEFT JOIN 
      PlantSensorInfo psi ON pb.PlantId = psi.PlantId
  LEFT JOIN
      PlantInfo pi ON pb.PlantId = pi.PlantId
`;
  const queryResult = await request.query(sqlQuery);
  await dbConnection.disconnect();
  console.log("sensor data recordset",queryResult.recordset);
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
    const minutes = 25;
    const queryResult = await request
      .input('microcontrollerId', sql.VarChar(20), micrcontrolleridPrefix)
      .input('minutes', sql.Int, minutes)
      .query(getLatestMicroControllerSensorReadingQuery);
    await dbConnection.disconnect();
    console.log("should update funtion recrodset",queryResult.recordset)
    if (!queryResult.recordset.length){
        return shouldUpdate;
    }
    let rows = queryResult.recordset[0];
    if (!rows){
        return shouldUpdate;
    }
    if (microcontrollerIdSuffix == 1 ){
        if (rows.Temperature === null && rows.pH !== null){
            shouldUpdate = true;
        }
        console.log("rows.temperature is ", rows.Temperature, "rows.pH is ", rows.pH);
        // console.log("rows.pH is ", rows.pH);

    }else if (microcontrollerIdSuffix == 2){
        if (rows.pH === null && rows.Temperature !== null){
            shouldUpdate = true;
        }
        console.log("rows.temperature is ", rows.Temperature, "rows.pH is ", rows.pH);
        // console.log("rows.temperature is ", rows.temperature);
        // console.log("rows.pH is ", rows.pH);
    }
    await dbConnection.disconnect();
    return shouldUpdate;
}


async function getActivePlantBatchSensorData() {
  const sqlQuery = `
    SELECT 
      sr.Datetime,
      sr.MicrocontrollerID,
      sr.PlantBatchId,
      pi.PlantName,
      sr.Temperature,
      sr.Humidity,
      sr.Brightness,
      sr.pH,
      sr.CO2,
      sr.EC,
      sr.TDS,
      pb.PlantId,
      psi.Temperature_min,
      psi.Temperature_max,
      psi.Temperature_optimal,
      psi.Humidity_min,
      psi.Humidity_max,
      psi.Humidity_optimal,
      psi.Brightness_min,
      psi.Brightness_max,
      psi.Brightness_optimal,
      psi.pH_min,
      psi.pH_max,
      psi.pH_optimal,
      psi.CO2_min,
      psi.CO2_max,
      psi.CO2_optimal,
      psi.EC_min,
      psi.EC_max,
      psi.EC_optimal,
      psi.TDS_min,
      psi.TDS_max,
      psi.TDS_optimal
    FROM 
      SensorReadings sr
    LEFT JOIN 
      PlantBatch pb ON sr.PlantBatchId = pb.PlantBatchId
    LEFT JOIN 
      PlantSensorInfo psi ON pb.PlantId = psi.PlantId
    LEFT JOIN
      PlantInfo pi ON pb.PlantId = pi.PlantId
    WHERE 
      pb.DatePlanted IS NOT NULL AND pb.DateHarvested IS NULL;
  `;
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  const queryResult = await request.query(sqlQuery);
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function getActivePlantBatchSensorDataXDaysAgo(x) {
  const sqlQuery = `
    SELECT 
      sr.Datetime,
      sr.MicrocontrollerID,
      sr.PlantBatchId,
      pi.PlantName,
      sr.Temperature,
      sr.Humidity,
      sr.Brightness,
      sr.pH,
      sr.CO2,
      sr.EC,
      sr.TDS,
      pb.PlantId,
      psi.Temperature_min,
      psi.Temperature_max,
      psi.Temperature_optimal,
      psi.Humidity_min,
      psi.Humidity_max,
      psi.Humidity_optimal,
      psi.Brightness_min,
      psi.Brightness_max,
      psi.Brightness_optimal,
      psi.pH_min,
      psi.pH_max,
      psi.pH_optimal,
      psi.CO2_min,
      psi.CO2_max,
      psi.CO2_optimal,
      psi.EC_min,
      psi.EC_max,
      psi.EC_optimal,
      psi.TDS_min,
      psi.TDS_max,
      psi.TDS_optimal
    FROM 
      SensorReadings sr
    LEFT JOIN 
      PlantBatch pb ON sr.PlantBatchId = pb.PlantBatchId
    LEFT JOIN 
      PlantSensorInfo psi ON pb.PlantId = psi.PlantId
    LEFT JOIN
      PlantInfo pi ON pb.PlantId = pi.PlantId
    WHERE 
      pb.DatePlanted IS NOT NULL 
      AND pb.DateHarvested IS NULL
      AND sr.Datetime >= DATEADD(day, -@days, GETDATE());
  `;
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  const queryResult = await request.input('days', x).query(sqlQuery);
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function getLatestActivePlantBatchSensorData(){
  const sqlQuery = `
  WITH LatestEntries AS (
    SELECT 
        sr.Datetime,
        sr.MicrocontrollerID,
        sr.PlantBatchId,
        pi.PlantName,
        sr.Temperature,
        sr.Humidity,
        sr.Brightness,
        sr.pH,
        sr.CO2,
        sr.EC,
        sr.TDS,
        pb.PlantId,
        psi.Temperature_min,
        psi.Temperature_max,
        psi.Temperature_optimal,
        psi.Humidity_min,
        psi.Humidity_max,
        psi.Humidity_optimal,
        psi.Brightness_min,
        psi.Brightness_max,
        psi.Brightness_optimal,
        psi.pH_min,
        psi.pH_max,
        psi.pH_optimal,
        psi.CO2_min,
        psi.CO2_max,
        psi.CO2_optimal,
        psi.EC_min,
        psi.EC_max,
        psi.EC_optimal,
        psi.TDS_min,
        psi.TDS_max,
        psi.TDS_optimal,
        ROW_NUMBER() OVER (PARTITION BY pb.PlantBatchId ORDER BY sr.Datetime DESC) AS RowNum
    FROM 
        SensorReadings sr
    LEFT JOIN 
        PlantBatch pb ON sr.PlantBatchId = pb.PlantBatchId
    LEFT JOIN 
        PlantSensorInfo psi ON pb.PlantId = psi.PlantId
    LEFT JOIN
        PlantInfo pi ON pb.PlantId = pi.PlantId
    WHERE 
        pb.DatePlanted IS NOT NULL AND pb.DateHarvested IS NULL
)
SELECT 
    Datetime,
    MicrocontrollerID,
    PlantBatchId,
    PlantName,
    Temperature,
    Humidity,
    Brightness,
    pH,
    CO2,
    EC,
    TDS,
    PlantId,
    Temperature_min,
    Temperature_max,
    Temperature_optimal,
    Humidity_min,
    Humidity_max,
    Humidity_optimal,
    Brightness_min,
    Brightness_max,
    Brightness_optimal,
    pH_min,
    pH_max,
    pH_optimal,
    CO2_min,
    CO2_max,
    CO2_optimal,
    EC_min,
    EC_max,
    EC_optimal,
    TDS_min,
    TDS_max,
    TDS_optimal
FROM 
    LatestEntries
WHERE 
    RowNum = 1;

  `;
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  const queryResult = await request.query(sqlQuery);
  await dbConnection.disconnect();
  return queryResult.recordset;



}

async function getAvailableExisitingMicrocontroller() {
  try {
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const result = await request.query(`
      SELECT MicrocontrollerId 
      FROM MicrocontrollerPlantBatchPair 
      WHERE PlantBatchId IS NULL;
    `);
    await dbConnection.disconnect();
    return result.recordset;
  } catch (error) {
    console.error('Error executing query:', error);
    await dbConnection.disconnect();
    throw error;
  }
}

async function insertNewMicrocontroller(microcontollerId){
  try{
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const result = await request
    .input('microcontrollerId', sql.VarChar, microcontollerId)
    .query(`INSERT INTO MicrocontrollerPlantBatchPair (MicrocontrollerId, PlantBatchId) 
    VALUES (@microcontrollerId, null)`);
    await dbConnection.disconnect();
    return 1;
  } catch (error){
    console.log("Error inserting microcontroller id:" , error);
    await dbConnection.disconnect();
    throw error;
  }
}

async function verifyMicrocontrollerIdValidForDeletion(microcontrollerId){
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  const result = await request
    .input('microcontrollerId', sql.VarChar, microcontrollerId)
    .query(`SELECT * FROM MicrocontrollerPlantBatchPair WHERE PlantBatchId is NULL AND MicrocontrollerId = @microcontrollerId;`);
  console.log("Currently executing verifyMicrocontrollerIdValidForDeletion");
  console.log("verifyMicrocontrollerIdValidForDeletion", result.recordset);
  console.log("verifyMicrocontrollerIdValidForDeletion", result.recordset[0]);
  if(!result.recordset[0]){
    return 0;
  }
  await dbConnection.disconnect();
  return 1;
}

async function deleteMicrocontroller(microcontrollerId){
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try{
    await request
      .input('microcontrollerId', sql.VarChar, microcontrollerId)
      .query(`DELETE FROM MicrocontrollerPlantBatchPair WHERE MicrocontrollerId = @microcontrollerId;`);
    await dbConnection.disconnect();
    return 1;
  }catch(error){
    console.log("Error encountered when deleting microcontroller",error);
    await dbConnection.disconnect();
    throw error;
  }
}

async function verifyCurrentAndNewMicrocontrollerIdValid(
  currentMicrocontrollerId,
  newMicrocontrollerId
) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try {
    const currentMicrocontrollerIdSQLQuery = `
  SELECT * FROM MicrocontrollerPlantBatchPair 
  WHERE 
  MicrocontrollerId = @currentMicrocontrollerId AND PlantBatchId is NOT NULL`;
    const newMicrocontrollerIdSQLQuery = `
  SELECT * FROM MicrocontrollerPlantBatchPair 
  WHERE 
  MicrocontrollerId = @newMicrocontrollerId AND PlantBatchId is NULL`;

  let currentMicrocontrollerIdList = await request.input("currentMicrocontrollerId", sql.VarChar, currentMicrocontrollerId)
  .query(currentMicrocontrollerIdSQLQuery);

  let newMicrocontrollerIdList = await request.input("newMicrocontrollerId", sql.VarChar, newMicrocontrollerId)
  .query(newMicrocontrollerIdSQLQuery);

  
    console.log("Verifying current and new microcontroller id", currentMicrocontrollerIdList.recordset, newMicrocontrollerIdList.recordset);
    await dbConnection.disconnect();
    if (
      currentMicrocontrollerIdList.recordset.length &&
      newMicrocontrollerIdList.recordset.length
    ) {
      return 1;
    }
    return 0;
  } catch (error) {
    console.log(
      "Error encoutered at verifying current and new microcontroller:",
      error
    );
    await dbConnection.disconnect();
    throw error;
  }
}

async function updateCurrentMicrocontrollerForNewMicrocontroller(currentMicrocontrollerId, newMicrocontrollerId){
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try{
    let updateCurrentMicrocontrollerIdQuery = `UPDATE MicrocontrollerPlantBatchPair SET MicrocontrollerId = @newMicrocontrollerId WHERE MicrocontrollerId = @currentMicrocontrollerId AND PlantBatchId is not NULL`;
    let updateNewMicrocontrollerIdQuery = `UPDATE MicrocontrollerPlantBatchPair SET MicrocontrollerId = @currentMicrocontrollerId WHERE MicrocontrollerId = @newMicrocontrollerId AND PlantBatchId is NULL`;
    await request
    .input("currentMicrocontrollerId", sql.VarChar, currentMicrocontrollerId)
    .input("newMicrocontrollerId", sql.VarChar, newMicrocontrollerId)
    .query(updateCurrentMicrocontrollerIdQuery);
    await request.query(updateNewMicrocontrollerIdQuery);
    return 1;

  }catch(error){
    console.log("Encountered error in updating current for new microcontroller: ", error);
    throw error;
  }
}

///trial functions
async function getActivePlantBatchSensorDataTrial() {
  const sensorDataSqlQuery = `
    SELECT 
      sr.Datetime,
      sr.MicrocontrollerID,
      sr.PlantBatchId,
      pb.PlantId,
      pi.PlantName,
      sr.Temperature,
      sr.Humidity,
      sr.Brightness,
      sr.pH,
      sr.CO2,
      sr.EC,
      sr.TDS
      
    FROM 
      SensorReadings sr
    LEFT JOIN 
      PlantBatch pb ON sr.PlantBatchId = pb.PlantBatchId
    LEFT JOIN
      PlantInfo pi ON pb.PlantId = pi.PlantId
    WHERE 
      pb.DatePlanted IS NOT NULL AND pb.DateHarvested IS NULL;
  `;
  const plantSensorInfoSqlQuery = `SELECT * from PlantSensorInfo;`;
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  const sensorDataQueryResult = await request.query(sensorDataSqlQuery);
  const plantSensorInfoQueryResult = await request.query(plantSensorInfoSqlQuery);
  await dbConnection.disconnect();
  return {"sensorData": sensorDataQueryResult.recordset, "plantSensorInfo": plantSensorInfoQueryResult.recordset};
}

module.exports = {
  deleteMicrocontroller,
  getAllSensorData,
  getPlantBatchIdGivenMicrocontrollerPrefix,
  getActivePlantBatchSensorData,
  getActivePlantBatchSensorDataXDaysAgo,
  getLatestActivePlantBatchSensorData,
  getAvailableExisitingMicrocontroller,
  insertSensorValuesSuffix1,
  insertSensorValuesSuffix2,
  insertNewMicrocontroller,
  updateCurrentMicrocontrollerForNewMicrocontroller,
  verifyCurrentAndNewMicrocontrollerIdValid,
  verifyMicrocontrollerIdValidForDeletion,
  //trial function
  getActivePlantBatchSensorDataTrial,
};
