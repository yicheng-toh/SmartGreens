/*
\This file contains all the necessary plant related logic for plants route
this is designed specifically for MYSQL database.
*/
const sql = require("../sql.js");
const { dbConnection } = require("./mysql.js");
//Functions will be divided into different tables

async function getAllPlantHarvestData() {
  const query = `
            SELECT
                PlantInfo.PlantID,
                PlantInfo.PlantName,
                COALESCE(SUM(PlantBatch.WeightHarvested), 0) AS TotalQuantityHavested
            FROM
                PlantInfo
            LEFT JOIN
                PlantBatch ON PlantInfo.PlantID = PlantBatch.PlantID
            GROUP BY
                PlantInfo.PlantID, PlantInfo.PlantName;
        `;
  queryResult = await dbConnection.promise().query(query);
  return queryResult[0];
}

async function getAllPlantInfo() {
  queryResult = await dbConnection.promise().query("SELECT * FROM PlantInfo");
  return queryResult[0];
}

async function getAllPlantSeedInventory() {
  queryResult = await dbConnection
    .promise()
    .query("SELECT CurrentSeedInventory FROM PlantInfo");
  return queryResult[0];
}

async function getAllPlantBatchInfoAndYield() {
  const plantBatchQuery = `
  WITH PlantBatchSummary AS (
    SELECT 
        pb.PlantId,
        COALESCE(SUM(pb.WeightHarvested), 0) AS TotalHarvested,
        COALESCE(SUM(pb.QuantityPlanted), 0) AS TotalPlanted,
        COALESCE(SUM(pb.WeightHarvested) / NULLIF(SUM(pb.QuantityPlanted), 0), 0) AS YieldRate
    FROM 
        PlantBatch pb
    WHERE 
        pb.DatePlanted IS NOT NULL
        AND pb.DateHarvested IS NOT NULL
    GROUP BY 
        pb.PlantId
)

SELECT
    pb.PlantBatchId,
    pbs.PlantId,
    pi.PlantName,
    pb.DatePlanted,
    DATE_ADD(pb.DatePlanted, INTERVAL pi.DaysToMature DAY) AS ExpectedHarvestDate,
    pb.QuantityPlanted,
    pb.QuantityPlanted * pbs.YieldRate AS ExpectedYield
FROM
    PlantBatch pb
JOIN
    PlantInfo pi ON pb.PlantId = pi.PlantId
JOIN
    PlantBatchSummary pbs ON pb.PlantId = pbs.PlantId;

  `;
  queryResult = await dbConnection.promise().query(plantBatchQuery);
  console.log(queryResult);
  return queryResult[0];
}

async function getActivePlantBatchInfoAndYield() {
  try{
    const plantBatchQuery = `
    WITH PlantBatchSummary AS (
      SELECT 
          pb.PlantId,
          COALESCE(SUM(pb.WeightHarvested), 0) AS TotalHarvested,
          COALESCE(SUM(pb.QuantityPlanted), 0) AS TotalPlanted,
          COALESCE(SUM(pb.WeightHarvested) / NULLIF(SUM(pb.QuantityPlanted), 0), 0) AS YieldRate
      FROM 
          PlantBatch pb
      WHERE 
          pb.DatePlanted IS NOT NULL
          AND pb.DateHarvested IS NOT NULL
      GROUP BY 
          pb.PlantId
  )

  SELECT
      pb.PlantBatchId,
      pbs.PlantId,
      pi.PlantName,
      pb.DatePlanted,
      pb.PlantLocation,
      m.MicrocontrollerId,
      DATE_ADD(pb.DatePlanted, INTERVAL pi.DaysToMature DAY) AS ExpectedHarvestDate,
      pb.QuantityPlanted,
      pb.QuantityPlanted * pbs.YieldRate AS ExpectedYield
  FROM
      PlantBatch pb
  JOIN
      PlantInfo pi ON pb.PlantId = pi.PlantId
  JOIN
      MicrocontrollerPlantBatchPair m ON m.PlantBatchId = pb.PlantBatchId
  LEFT JOIN
      PlantBatchSummary pbs ON pb.PlantId = pbs.PlantId
  WHERE
      pb.DateHarvested IS NULL;

    `;
    queryResult = await dbConnection.promise().query(plantBatchQuery);
    console.log(queryResult);
    return queryResult[0];
  }catch(error){
    console.log("Error encoutntered in active plant batch and yield: ", error);
    throw error;
  }
}

async function getAllPlantYieldRate() {
  const yieldRateQuery = `
    SELECT 
        PlantId,
        COALESCE(SUM(WeightHarvested), 0) AS TotalHarvested,
        COALESCE(SUM(QuantityPlanted), 0) AS TotalPlanted,
        COALESCE(SUM(WeightHarvested) / SUM(QuantityPlanted), 0) AS YieldRate
    FROM 
        PlantBatch
    WHERE 
        DatePlanted IS NOT NULL
        AND DateHarvested IS NOT NULL
    GROUP BY 
        PlantId
`;
  queryResult = await dbConnection.promise().query(yieldRateQuery);
  console.log(queryResult);
  return queryResult[0];
}

async function insertNewPlant(plantName, SensorsRanges, DaysToMature) {
  const result = await dbConnection.execute(
    "INSERT INTO PlantInfo (PlantName,SensorsRanges,DaysToMature) VALUES (?, ?, ?)",
    [plantName, SensorsRanges, DaysToMature]
  );
  return 1;
}

//This function may need to be broken up in the routes for error catching.
async function harvestPlant(plantBatchId, dateHarvested, weightHarvested) {
  //check if quantity harvested is greater than the quantity planted.
  const quantityPlantedResultList = await dbConnection
    .promise()
    .query(
      "SELECT QuantityPlanted FROM PlantBatch WHERE PlantBatchId = ?",
      plantBatchId
    );
  const quantityPlanted = quantityPlantedResultList[0][0].QuantityPlanted;
  if (weightHarvested > quantityPlanted) {
    return 0;
  }
  // const currentDate = new Date(); // Assuming you are using JavaScript to get the current date and time

  await dbConnection.execute(
    "UPDATE PlantBatch SET weightHarvested = ?, DateHarvested = ? WHERE plantBatchId = ?;",
    [weightHarvested, dateHarvested, plantBatchId]
  );

  //   await dbConnection.execute(
  //     "UPDATE PlantBatch SET weightHarvested = ? WHERE plantBatchId = ?;",
  //     [weightHarvested, plantBatchId]
  //   );
  // const plantIdResultList = await dbConnection.prommise().query('SELECT plantId FROM PlantBatch WHERE PlantBatchId = ?',
  //     [plantBatchId])[0];
  // const plantId = plantIdResultList[0].plantId;
  // await updatePlantHarvestData(plantId, weightHarvested);
  await dbConnection.execute(
    "UPDATE MicrocontrollerPlantBatchPair SET plantBatchId= NULL WHERE PlantBatchId = ?",
    [plantBatchId]
  );
  return 1;
}

//This function may need to be broken up in the routes for error catching.
async function growPlant(
  plantId,
  plantLocation,
  microcontrollerId,
  quantityDecrement,
  datePlanted
) {

  //update the seed inventory
  const result = await dbConnection.execute(
    "INSERT INTO PlantBatch (plantID, plantLocation, quantityPlanted, datePlanted) VALUES (?,?,?,?)",
    [plantId, plantLocation, quantityDecrement, datePlanted]
  );
  // console.log(result);
  // console.log(result.insertId);
  const plantBatchId = result.insertId;
  const originalQuantityResultList = await dbConnection
    .promise()
    .query(
      "SELECT PlantId, PlantName, CurrentSeedInventory FROM PlantInfo WHERE PlantId = ?",
      plantId
    );
  // console.log(originalQuantityResultList);
  // console.log(originalQuantityResultList[0]);
  // console.log(!originalQuantityResultList[0]);
  // console.log(!originalQuantityResultList[0].length);
  // console.log(originalQuantityResultList[0][0]);
  if (!originalQuantityResultList[0].length) {
    return 0;
  }
  const originalQuantity =
    originalQuantityResultList[0][0].CurrentSeedInventory;
  // console.log("original quantity", originalQuantity);
  // console.log("quanttiey decreemtn", quantityDecrement);
  if (quantityDecrement > originalQuantity) {
    return 0;
  }
  const updatedQuantity = originalQuantity - quantityDecrement;
  await dbConnection.execute(
    "UPDATE PlantInfo SET CurrentSeedInventory = ? WHERE plantId = ?;",
    [updatedQuantity, plantId]
  );
  //update the microcontoller batch table.
  await dbConnection.execute(
    "INSERT INTO MicrocontrollerPlantbatchPair (microcontrollerId, plantBatchId) VALUES (?, ?) ON DUPLICATE KEY UPDATE microcontrollerId = VALUES(microcontrollerId), plantBatchId = VALUES(plantBatchId)",
    [microcontrollerId, plantBatchId]
  );
  return 1;
}

async function updatePlantSeedInventory(plantId, quantityChange) {
  const currentQuantityResultList = await dbConnection
    .promise()
    .query(
      "SELECT CurrentSeedInventory FROM PlantInfo WHERE PlantId = ?",
      plantId
    );
  console.log(currentQuantityResultList);
  console.log(currentQuantityResultList[0]);
  console.log(currentQuantityResultList[0][0]);
  if (!currentQuantityResultList[0].length) {
    return 0;
  }
  const currentQuantity = currentQuantityResultList[0][0].CurrentSeedInventory;
  console.log("current seed quantiy is", currentQuantity);
  const newQuantity = currentQuantity + quantityChange;
  await dbConnection.execute(
    "UPDATE PlantInfo SET CurrentSeedInventory = ? WHERE plantId = ?;",
    [newQuantity, plantId]
  );
  return 1;
}

async function verifyPlantExists(plantId) {
  const plantIdList = await dbConnection
    .promise()
    .query("SELECT id FROM PlantInfo WHERE PlantId= ?", plantId);
  return plantIdList[0].length;
}

//need to rethink on how to write the functions......write them based on sql queries... or....
//there is no harvest plant info. i.e. no logic to harvest plant.

async function updatePlantSensorInfo(data) {
  try {
    // Check if the PlantId exists
    const plantSensorEntry = await dbConnection
      .promise()
      .query("SELECT * FROM PlantSensorInfo WHERE PlantId = ?", [data.plantId]);
    // console.log("existingRows",plantSensorEntry);

    if (plantSensorEntry[0].length <= 0) {
      // If PlantId does not exist, insert a new row
      await dbConnection.execute(
        "INSERT INTO PlantSensorInfo (PlantId, Temperature_min, Temperature_max, Temperature_optimal, Humidity_min, Humidity_max, Humidity_optimal, Brightness_min, Brightness_max, Brightness_optimal, pH_min, pH_max, pH_optimal, CO2_min, CO2_max, CO2_optimal, EC_min, EC_max, EC_optimal, TDS_min, TDS_max, TDS_optimal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          data.plantId,
          data.temperature_min,
          data.temperature_max,
          data.temperature_optimal,
          data.humidity_min,
          data.humidity_max,
          data.humidity_optimal,
          data.brightness_min,
          data.brightness_max,
          data.brightness_optimal,
          data.pH_min,
          data.pH_max,
          data.pH_optimal,
          data.CO2_min,
          data.CO2_max,
          data.CO2_optimal,
          data.EC_min,
          data.EC_max,
          data.EC_optimal,
          data.TDS_min,
          data.TDS_max,
          data.TDS_optimal,
        ]
      );
    } else {
      // If PlantId exists, update the existing row
      await dbConnection.execute(
        "UPDATE PlantSensorInfo SET Temperature_min = ?, Temperature_max = ?, Temperature_optimal = ?, Humidity_min = ?, Humidity_max = ?, Humidity_optimal = ?, Brightness_min = ?, Brightness_max = ?, Brightness_optimal = ?, pH_min = ?, pH_max = ?, pH_optimal = ?, CO2_min = ?, CO2_max = ?, CO2_optimal = ?, EC_min = ?, EC_max = ?, EC_optimal = ?, TDS_min = ?, TDS_max = ?, TDS_optimal = ? WHERE PlantId = ?",
        [
          data.temperature_min,
          data.temperature_max,
          data.temperature_optimal,
          data.humidity_min,
          data.humidity_max,
          data.humidity_optimal,
          data.brightness_min,
          data.brightness_max,
          data.brightness_optimal,
          data.pH_min,
          data.pH_max,
          data.pH_optimal,
          data.CO2_min,
          data.CO2_max,
          data.CO2_optimal,
          data.EC_min,
          data.EC_max,
          data.EC_optimal,
          data.TDS_min,
          data.TDS_max,
          data.TDS_optimal,
          data.plantId,
        ]
      );
    }

    // Return true indicating successful update
    return 1;
  } catch (error) {
    console.error("Error updating PlantSensorInfo:", error);
    return 0; // Return false indicating update failure
  }
}

async function updatePlantInfo(
  plantId,
  plantName,
  plantPicture,
  daysToMature,
  currentSeedInventory
) {
  try {
    sqlQuery = `
  UPDATE PlantInfo
  SET PlantName = ?, PlantPicture = ?, DaysToMature = ?, CurrentSeedInventory = ?
  WHERE PlantId = ?`;
    await dbConnection.execute(sqlQuery, [
      plantName,
      plantPicture,
      daysToMature,
      currentSeedInventory,
      plantId,
    ]);
    return 1;
  } catch (error) {
    console.log("Error updating data: ", error);
    throw error;
  }
}

async function getAllPlantBatchInfo() {
  queryResult = await dbConnection.promise().query(
    `SELECT * FROM PlantBatch 
      LEFT JOIN 
        PlantInfo ON PlantInfo.PlantID = PlantBatch.PlantID`
  );
  return queryResult[0];
}

async function verifyPlantBatchIsGrowing(plantBatchId) {
  try {
    let queryResult = await dbConnection
      .promise()
      .query(`SELECT * FROM PlantBatch WHERE PlantBatchId = ?`, [plantBatchId]);
    console.log("verifyPlantBatchIsGrowing", queryResult);
    console.log("verifyPlantBatchIsGrowing", queryResult[0]);
    console.log("verifyPlantBatchIsGrowing", queryResult[0][0]);
    console.log("verifyPlantBatchIsGrowing", queryResult[0][0].DateHarvested);
    if (!queryResult[0][0].DatePlanted) {
      return 0;
    }
    if (queryResult[0][0].DateHarvested !== null) {
      console.log("verifyPlantBatchIsGrowing", queryResult[0][0].DateHarvested);
      return 0;
    }
    return 1;
  } catch (error) {
    console.error("Error verifying plant batch:", error);
    return 0;
  }
}

async function updateGrowingPlantBatchDetails(
  plantBatchId,
  plantId,
  datePlanted,
  quantityPlanted,
  location
) {
  try {
    const sqlQuery = `
      UPDATE PlantBatch
      SET DatePlanted = ?, QuantityPlanted = ?, PlantLocation = ?, PlantId = ?
      WHERE PlantBatchId = ?
    `;
    const result = await dbConnection.execute(sqlQuery, [
      datePlanted,
      quantityPlanted,
      location,
      plantId,
      plantBatchId,
    ]);
    console.log("updateGrowingPlantBatchDetails", result);
    console.log("updateGrowingPlantBatchDetails", result[0]);
  } catch (error) {
    console.error("Error updating growing plant batch details:", error);
    return 0; // Return 0 to indicate failure
  }
}

async function updateHarvestedPlantBatchDetails(
  plantBatchId,
  plantId,
  datePlanted,
  quantityPlanted,
  dateHarvested,
  weightHarvested,
  location
) {
  
  try {
    const sqlQuery = `
      UPDATE PlantBatch
      SET DatePlanted = ?, QuantityPlanted = ?, DateHarvested = ?, WeightHarvested = ?, PlantLocation = ?, PlantId = ?
      WHERE PlantBatchId = ?
    `;
    const result = await dbConnection.execute(sqlQuery, [
      datePlanted,
      quantityPlanted,
      dateHarvested,
      weightHarvested,
      location,
      plantId,
      plantBatchId,
    ]);
    console.log("new plant id is ", plantId);
    console.log("updateHarvestedPlantBatchDetails", "result[0]", result[0]);
    return 1; // Successful update
  } catch (error) {
    console.error("Error updating growing plant batch details:", error);
    return 0; // Return 0 to indicate failure
  }
}

async function getPlantBatchDatePlanted(plantBatchId) {
  const sqlQuery = `SELECT DatePlanted FROM PlantBatch WHERE PlantBatchId = ?`;
  try {
    let result = await dbConnection.promise().query(sqlQuery, [plantBatchId]);
    return result[0].DatePlanted;
  } catch (error) {
    console.error("Error getting plant batch DatePlanted:", error);
    throw error;
  }
}

async function deletePlantBatch(plantBatchId) {
  try {
    await dbConnection.execute(
      "DELETE FROM SensorReadings WHERE PlantBatchId = ?",
      [plantBatchId]
    );
    await dbConnection.execute(
      "DELETE FROM PlantBatch WHERE PlantBatchId = ?",
      [plantBatchId]
    );
    return 1;
  } catch (error) {
    console.error("Error deleting plant batch data", error);
    throw error;
  }
}

async function getAllHarvestedPlantBatchInfo(){
  try{
    let sqlQuery = `SELECT 
    pb.PlantBatchId,
    pb.PlantId,
    pi.PlantName,
    pb.PlantLocation,
    pb.QuantityPlanted,
    pb.WeightHarvested,
    pb.DatePlanted,
    pb.DateHarvested
    FROM PLANTBATCH pb
    JOIN PlantInfo pi ON pi.PlantId = pb.PlantId
    WHERE pb.DateHarvested is NOT NULL;`;
    let result = await dbConnection.promise().query(sqlQuery);
    return result[0];

  }catch(error){
    console.log("Error in function getAllHarvestedPlantBatchInfo", error);
    throw error;
  }
}

async function getAllPlantYieldRateByMonth(){
  try{
    const sqlQuery = `
        SELECT 
        pb.plantId,
        pi.plantName,
        YEAR(DateHarvested) AS year,
        MONTHNAME(DateHarvested) AS month,
        SUM(weightHarvested) AS total_weight_harvested
      FROM PlantBatch pb
      JOIN PlantInfo pi ON pi.PlantId = pb.PlantId
      WHERE DateHarvested >= 
        CASE 
            WHEN DAY(CURRENT_DATE) = 1 THEN DATE_SUB(DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), INTERVAL 1 MONTH)
            ELSE DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
        END
      AND DateHarvested <= CURRENT_DATE
      GROUP BY plantId, YEAR(DateHarvested), MONTH(DateHarvested), MONTHNAME(DateHarvested)
      ORDER BY plantId, YEAR(DateHarvested), MONTH(DateHarvested);
    `;
    let result = await dbConnection.promise().query(sqlQuery);
    return result[0];
  }catch(error){
    console.log("Error in function getAllHarvestedPlantBatchInfo", error);
    throw error;
  }
}

async function getAllPlantYieldRateByWeek(){
  try{
    const sqlQuery = `
        SELECT 
        pb.plantId,
        pi.plantName,
        YEAR(DateHarvested) AS year,
        WEEK(DateHarvested) AS weekNumber,
        SUM(weightHarvested) AS total_weight_harvested
      FROM PlantBatch pb
      JOIN PlantInfo pi ON pi.PlantId = pb.PlantId
      WHERE DateHarvested >= DATE_SUB(CURDATE(), INTERVAL 11 WEEK)
        AND DateHarvested <= CURDATE()
      GROUP BY plantId, YEAR(DateHarvested), WEEK(DateHarvested)
      ORDER BY plantId, YEAR(DateHarvested), WEEK(DateHarvested);
    `;
    let result = await dbConnection.promise().query(sqlQuery);
    return result[0];
  }catch(error){
    console.log("Error in function getAllHarvestedPlantBatchInfo", error);
    throw error;
  }
}


module.exports = {
  deletePlantBatch,
  getActivePlantBatchInfoAndYield,
  getAllPlantHarvestData,
  getAllPlantInfo,
  insertNewPlant,
  getAllPlantBatchInfo,
  getAllPlantBatchInfoAndYield,
  getAllPlantSeedInventory,
  getAllPlantYieldRate,
  getAllPlantYieldRateByMonth,
  getAllPlantYieldRateByWeek,
  getPlantBatchDatePlanted,
  getAllHarvestedPlantBatchInfo,
  growPlant,
  harvestPlant,
  updateGrowingPlantBatchDetails,
  updateHarvestedPlantBatchDetails,
  updatePlantSeedInventory,
  updatePlantSensorInfo,
  updatePlantInfo,
  verifyPlantExists,
  verifyPlantBatchIsGrowing,
};
