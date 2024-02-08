const { dbConnection } = require("./mysql.js");

//intead of microcontoller id plantbatch pair,
//it would be micrcontrollerid prefix plantbatch pair
async function getPlantBatchIdGivenMicrocontrollerPrefix(
  microcontrollerIdPrefix
) {
  const queryResult = await dbConnection.promise().query(
    `SELECT PlantBatchId
    FROM MicrocontrollerPlantBatchPair
    WHERE MicrocontrollerId = ?`,
    [microcontrollerIdPrefix]
  );
//   console.log("rows is rows", rows);
//   let queryResult = rows;
  console.log("qyuery resutl ist",queryResult);
  console.log(queryResult[0])
  if (queryResult[0].length) {
    console.log(queryResult);
    console.log(queryResult[0]);
    return queryResult[0][0];
  }
  return -1;
}

async function shouldUpdateExisingSensorReadings(micrcontrolleridPrefix, microcontrollerIdSuffix){
    let shouldUpdate = false;
    const getLatestMicroContollerSensorReadingQuery = `
        SELECT *
        FROM SensorReadings
        WHERE MicrocontrollerID = ? 
            AND Datetime >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        ORDER BY Datetime DESC
        LIMIT 1;
    `;
    const minutes = 5;
    const queryResult = await dbConnection.promise().query(getLatestMicroContollerSensorReadingQuery, [micrcontrolleridPrefix, minutes]);
    if (queryResult == undefined){
        return shouldUpdate;
    }
    let [rows] = queryResult[0];
    if (!rows){
        return shouldUpdate;
    }
    if (microcontrollerIdSuffix == 1 ){
        if (rows.temperature == null){
            shouldUpdate = true;
        }

    }else if (microcontrollerIdSuffix == 2){
        if (rows.pH == null){
            shouldUpdate = true;
        }
    }
    return shouldUpdate;
}

//insert data into the database.
//TODO this is to be updated to phase 2 code.
async function insertSensorValuesSuffix1(
  dateTime,
  microcontrollerIdPrefix,
  microcontrollerIdSuffix,
  plantBatch,
  temperature,
  humidity,
  brightness
) {
   let shouldUpdate = await shouldUpdateExisingSensorReadings(microcontrollerIdPrefix, microcontrollerIdSuffix);
   console.log("should update is", shouldUpdate);
   console.log("Insert data suffix1 shouldUpdate:", shouldUpdate);
   console.log("mc id previx is", microcontrollerIdPrefix);
   if (shouldUpdate){
    
    await dbConnection.execute(
        `
        UPDATE SensorReadings
        SET
          Temperature = ?,
          Humidity = ?,
          Brightness = ?
        WHERE
          MicrocontrollerId = ? AND
          PlantBatchId = ? AND
          DateTime = (
            SELECT MAX(DateTime)
            FROM (SELECT * FROM SensorReadings) AS temp
            WHERE MicrocontrollerId = ?
          )
        `,
        [temperature, humidity, brightness, microcontrollerIdPrefix, plantBatch, microcontrollerIdPrefix]
      );

   }else{
    await dbConnection.execute(
        "INSERT INTO SensorReadings (DateTime, MicrocontrollerId, PlantBatchId, Temperature, Humidity, Brightness) VALUES (?, ?, ?, ?, ?, ?)",
        [dateTime, microcontrollerIdPrefix, plantBatch, temperature, humidity, brightness]
      );
   }
  
  return 1;
}

async function insertSensorValuesSuffix2(
  dateTime,
  microcontrollerIdPrefix,
  microcontrollerIdSuffix,
  plantBatch,
  pH, CO2, EC, TDS
) {
   let shouldUpdate = shouldUpdateExisingSensorReadings(microcontrollerIdPrefix, microcontrollerIdSuffix);
   if (shouldUpdate){
    await dbConnection.execute(
        `
        UPDATE SensorReadings
        SET
          pH = ?,
          CO2 = ?,
          EC = ?,
          TDS = ?
        WHERE
          MicrocontrollerId = ? AND
          PlantBatchId = ? AND
          DateTime = (
            SELECT MAX(DateTime)
            FROM (SELECT * FROM SensorReadings) AS temp
            WHERE MicrocontrollerId = ?
          )
        `,
        [pH, CO2, EC, TDS, microcontrollerIdPrefix, plantBatch, microcontrollerIdPrefix]
      );

   }else{
    await dbConnection.execute(
        "INSERT INTO SensorReadings (DateTime, MicrocontrollerId, PlantBatchId, pH, CO2, EC, TDS) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [dateTime, microcontrollerIdPrefix, plantBatch, pH, CO2, EC, TDS]
      );
   }
  
  return 1;
}

//retrieve all data regardless of the microcontroller and batch id.
async function getAllSensorData() {
  const queryResult = await dbConnection
    .promise()
    .query("SELECT * FROM SensorReadings");
  return queryResult[0];
}

module.exports = {
  getAllSensorData,
  getPlantBatchIdGivenMicrocontrollerPrefix,
  insertSensorValuesSuffix1,
  insertSensorValuesSuffix2,
};
