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
  console.log("query resutl ist", queryResult);
  console.log(queryResult[0]);
  if (queryResult[0].length) {
    console.log(queryResult);
    console.log(queryResult[0]);
    return queryResult[0][0];
  }
  // return -1;
  //to change it back later
  return 1;
}

async function shouldUpdateExisingSensorReadings(
  micrcontrolleridPrefix,
  microcontrollerIdSuffix
) {
  let shouldUpdate = false;
  const getLatestMicroContollerSensorReadingQuery = `
        SELECT *
        FROM SensorReadings
        WHERE MicrocontrollerID = ? 
            AND Datetime >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        ORDER BY Datetime DESC
        LIMIT 1;
    `;
  const minutes = 25;
  const queryResult = await dbConnection
    .promise()
    .query(getLatestMicroContollerSensorReadingQuery, [
      micrcontrolleridPrefix,
      minutes,
    ]);
  console.log("queryResult is", queryResult);
  if (queryResult == undefined) {
    return shouldUpdate;
  }
  let [rows] = queryResult[0];
  console.log("rows is", rows);
  if (!rows) {
    return shouldUpdate;
  }
  if (microcontrollerIdSuffix == 1) {
    if (rows.temperature == null && rows.pH != null) {
      shouldUpdate = true;
    }
    console.log("rows.temperature is", rows.temperature);
    console.log("rows.pH is ", rows.pH);
  } else if (microcontrollerIdSuffix == 2) {
    if (rows.pH == null && rows.temperature != null) {
      shouldUpdate = true;
    }
    console.log("rows.pH is ", rows.pH);
    console.log("rows.temperature is", rows.temperature);
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
  let shouldUpdate = await shouldUpdateExisingSensorReadings(
    microcontrollerIdPrefix,
    microcontrollerIdSuffix
  );
  console.log("should update is", shouldUpdate);
  console.log("Insert data suffix1 shouldUpdate:", shouldUpdate);
  console.log("mc id previx is", microcontrollerIdPrefix);
  if (shouldUpdate) {
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
      [
        temperature,
        humidity,
        brightness,
        microcontrollerIdPrefix,
        plantBatch,
        microcontrollerIdPrefix,
      ]
    );
  } else {
    await dbConnection.execute(
      "INSERT INTO SensorReadings (DateTime, MicrocontrollerId, PlantBatchId, Temperature, Humidity, Brightness) VALUES (?, ?, ?, ?, ?, ?)",
      [
        dateTime,
        microcontrollerIdPrefix,
        plantBatch,
        temperature,
        humidity,
        brightness,
      ]
    );
  }

  return 1;
}

async function insertSensorValuesSuffix2(
  dateTime,
  microcontrollerIdPrefix,
  microcontrollerIdSuffix,
  plantBatch,
  pH,
  CO2,
  EC,
  TDS
) {
  console.log("Currently in insertSensorValuesSuffix2");
  let shouldUpdate = await shouldUpdateExisingSensorReadings(
    microcontrollerIdPrefix,
    microcontrollerIdSuffix
  );
  console.log("should update", shouldUpdate);
  if (shouldUpdate) {
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
      [
        pH,
        CO2,
        EC,
        TDS,
        microcontrollerIdPrefix,
        plantBatch,
        microcontrollerIdPrefix,
      ]
    );
  } else {
    await dbConnection.execute(
      "INSERT INTO SensorReadings (DateTime, MicrocontrollerId, PlantBatchId, pH, CO2, EC, TDS) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [dateTime, microcontrollerIdPrefix, plantBatch, pH, CO2, EC, TDS]
    );
  }

  return 1;
}

//retrieve all data regardless of the microcontroller and batch id.
async function getAllSensorData() {
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
      psi.PlantId,
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
      PlantInfo pi ON psi.PlantId = pi.PlantId
  GROUP BY
    sr.Datetime,
    sr.MicrocontrollerID,
    sr.PlantBatchId;
`;

  // const queryResult = await dbConnection
  //   .promise()
  //   .query("SELECT * FROM SensorReadings");
  const queryResult = await dbConnection.promise().query(sqlQuery);
  return queryResult[0];
}
async function getAllSensorData2() {
  const sqlQuery = `
  SELECT 
    sr.PlantBatchId,
    CONCAT('[', GROUP_CONCAT(
        JSON_OBJECT(
            'Datetime', sr.Datetime,
            'MicrocontrollerID', sr.MicrocontrollerID,
            'Temperature', sr.Temperature,
            'Humidity', sr.Humidity,
            'Brightness', sr.Brightness,
            'pH', sr.pH,
            'CO2', sr.CO2,
            'EC', sr.EC,
            'TDS', sr.TDS,
            'PlantId', psi.PlantId,
            'Temperature_min', psi.Temperature_min,
            'Temperature_max', psi.Temperature_max,
            'Temperature_optimal', psi.Temperature_optimal,
            'Humidity_min', psi.Humidity_min,
            'Humidity_max', psi.Humidity_max,
            'Humidity_optimal', psi.Humidity_optimal,
            'Brightness_min', psi.Brightness_min,
            'Brightness_max', psi.Brightness_max,
            'Brightness_optimal', psi.Brightness_optimal,
            'pH_min', psi.pH_min,
            'pH_max', psi.pH_max,
            'pH_optimal', psi.pH_optimal,
            'CO2_min', psi.CO2_min,
            'CO2_max', psi.CO2_max,
            'CO2_optimal', psi.CO2_optimal,
            'EC_min', psi.EC_min,
            'EC_max', psi.EC_max,
            'EC_optimal', psi.EC_optimal,
            'TDS_min', psi.TDS_min,
            'TDS_max', psi.TDS_max,
            'TDS_optimal', psi.TDS_optimal
        )
    ), ']') AS data
FROM 
    SensorReadings sr
LEFT JOIN 
    PlantBatch pb ON sr.PlantBatchId = pb.PlantBatchId
LEFT JOIN 
    PlantSensorInfo psi ON pb.PlantId = psi.PlantId
GROUP BY
    sr.PlantBatchId;`;

  // const queryResult = await dbConnection
  //   .promise()
  //   .query("SELECT * FROM SensorReadings");
  const queryResult = await dbConnection.promise().query(sqlQuery);
  return queryResult[0];
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
    psi.PlantId,
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
    PlantInfo pi ON psi.PlantId = pi.PlantId
WHERE 
    pb.DatePlanted IS NOT NULL AND pb.DateHarvested IS NULL;
    `;
  const queryResult = await dbConnection.promise().query(sqlQuery);
  return queryResult[0];
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
      AND sr.Datetime >= NOW() - INTERVAL ? DAY;
  `;
  const queryResult = await dbConnection.promise().query(sqlQuery, [x]);
  return queryResult[0];
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
  const queryResult = await dbConnection.promise().query(sqlQuery);
  return queryResult[0];

}

async function getAvailableExisitingMicrocontroller(){
  sqlQuery = `
  SELECT MicrocontrollerId 
  FROM MicrocontrollerPlantBatchPair 
  WHERE PlantBatchId IS NULL;
  `
  const queryResult = await dbConnection.promise().query(sqlQuery);
  return queryResult[0];
}

module.exports = {
  getAllSensorData: getAllSensorData, //getAllSensorData2 does not work.
  getPlantBatchIdGivenMicrocontrollerPrefix,
  insertSensorValuesSuffix1,
  insertSensorValuesSuffix2,
  getActivePlantBatchSensorData,
  getActivePlantBatchSensorDataXDaysAgo,
  getLatestActivePlantBatchSensorData,
  getAvailableExisitingMicrocontroller,
};
