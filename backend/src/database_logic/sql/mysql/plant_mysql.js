/*
\This file contains all the necessary plant related logic for plants route
this is designed specifically for MYSQL database.
*/
const { dbConnection } = require("./mysql.js");
//Functions will be divided into different tables

async function getAllPlantHarvestData() {
  const query = `
            SELECT
                PlantInfo.PlantID,
                PlantInfo.PlantName,
                COALESCE(SUM(PlantBatch.QuantityHarvested), 0) AS TotalQuantityHavested
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
        COALESCE(SUM(pb.QuantityHarvested), 0) AS TotalHarvested,
        COALESCE(SUM(pb.QuantityPlanted), 0) AS TotalPlanted,
        COALESCE(SUM(pb.QuantityHarvested) / NULLIF(SUM(pb.QuantityPlanted), 0), 0) AS YieldRate
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

    pbs.YieldRate
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

async function getAllPlantYieldRate() {
  const yieldRateQuery = `
    SELECT 
        PlantId,
        COALESCE(SUM(QuantityHarvested), 0) AS TotalHarvested,
        COALESCE(SUM(QuantityPlanted), 0) AS TotalPlanted,
        COALESCE(SUM(QuantityHarvested) / SUM(QuantityPlanted), 0) AS YieldRate
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
async function harvestPlant(plantBatchId, dateHarvested, quantityHarvested) {
  //check if quantity harvested is greater than the quantity planted.
  const quantityPlantedResultList = await dbConnection
    .promise()
    .query(
      "SELECT QuantityPlanted FROM PlantBatch WHERE PlantBatchId = ?",
      plantBatchId
    );
  const quantityPlanted = quantityPlantedResultList[0][0].QuantityPlanted;
  if (quantityHarvested > quantityPlanted) {
    return 0;
  }
  // const currentDate = new Date(); // Assuming you are using JavaScript to get the current date and time

  await dbConnection.execute(
    "UPDATE PlantBatch SET quantityHarvested = ?, DateHarvested = ? WHERE plantBatchId = ?;",
    [quantityHarvested, dateHarvested, plantBatchId]
  );

  //   await dbConnection.execute(
  //     "UPDATE PlantBatch SET quantityHarvested = ? WHERE plantBatchId = ?;",
  //     [quantityHarvested, plantBatchId]
  //   );
  // const plantIdResultList = await dbConnection.prommise().query('SELECT plantId FROM PlantBatch WHERE PlantBatchId = ?',
  //     [plantBatchId])[0];
  // const plantId = plantIdResultList[0].plantId;
  // await updatePlantHarvestData(plantId, quantityHarvested);
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

// async function updatePlantHarvestData(plantId, quantityChange){
//     const currentQuantity = await dbConnection.promise().query('SELECT quantity FROM PlantHarvest WHERE PlantId = ?', plantId);
//     const newQuantity = currentQuantity[0].quantity + quantityChange;
//     await dbConnection.execute('UPDATE plantHarvest SET quantity = ? WHERE plant_id = ?;', [newQuantity, plantId]);
//     //remove from the microcontroller batch table.
//     return 1;

// }

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
    return true;
  } catch (error) {
    console.error("Error updating PlantSensorInfo:", error);
    return false; // Return false indicating update failure
  }
}

async function getAllPlantBatchInfo() {
  queryResult = await dbConnection
    .promise()
    .query(
      `SELECT * FROM PlantBatch 
      LEFT JOIN 
        PlantInfo ON PlantInfo.PlantID = PlantBatch.PlantID`
    );
  return queryResult[0];
}

async function verifyPlantBatchIsGrowing(plantBatchId){
  try {
    let queryResult = await dbConnection.promise().query(`SELECT * FROM PlantBatch WHERE PlantBatchId = ?`, [plantBatchId]);
    console.log("verifyPlantBatchIsGrowing", queryResult);
    console.log("verifyPlantBatchIsGrowing", queryResult[0]);
    console.log("verifyPlantBatchIsGrowing", queryResult[0][0]);
    console.log("verifyPlantBatchIsGrowing", queryResult[0][0].DateHarvested);
    if (!queryResult[0][0].DatePlanted) {
      return 0;
    }
    if (queryResult[0][0].DateHarvested !== null) {
      console.log("verifyPlantBatchIsGrowing", queryResult[0][0].DateHarvested)
      return 0;
    }
    return 1;
  } catch (error) {
    console.error("Error verifying plant batch:", error);
    return 0;
  }
}

async function updateGrowingPlantBatchDetails(plantBatchId, datePlanted, quantityPlanted) {
  try {
    const sqlQuery = `
      UPDATE PlantBatch
      SET DatePlanted = ?, QuantityPlanted = ?
      WHERE PlantBatchId = ?
    `;
    const result = await dbConnection.execute(sqlQuery, [datePlanted, quantityPlanted, plantBatchId]);
    console.log("updateGrowingPlantBatchDetails", result);
    console.log("updateGrowingPlantBatchDetails", result[0]);
  } catch (error) {
    console.error("Error updating growing plant batch details:", error);
    return 0; // Return 0 to indicate failure
  }
}

async function updateHarvestedPlantBatchDetails(plantBatchId, datePlanted, quantityPlanted, dateHarvested, quantityHarvested) {
  try {
    const sqlQuery = `
      UPDATE PlantBatch
      SET DatePlanted = ?, QuantityPlanted = ?, DateHarvested = ?, QuantityHarvested = ?
      WHERE PlantBatchId = ?
    `;
    const result = await dbConnection.execute(sqlQuery, [datePlanted, quantityPlanted, dateHarvested, quantityHarvested, plantBatchId]);
    console.log("updateHarvestedPlantBatchDetails","result[0]",result[0]);
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

async function deletePlantBatch(plantBatchId){
  try{
  //delete from plantbatch table
  await dbConnection.execute('DELETE FROM SensorReadings WHERE PlantBatchId = ?',[plantBatchId]);
  await dbConnection.execute('DELETE FROM PlantBatch WHERE PlantBatchId = ?',[plantBatchId]);
  return 1;
  }catch(error){
    console.error("Error deleting plant batch data", error);
    throw(error);
    return 0;
  }
  //delete from sensorreadingstable.
}

module.exports = {
  deletePlantBatch,
  getAllPlantHarvestData,
  getAllPlantInfo,
  insertNewPlant,
  getAllPlantBatchInfo,
  getAllPlantBatchInfoAndYield,
  getAllPlantSeedInventory,
  getAllPlantYieldRate,
  getPlantBatchDatePlanted,
  growPlant,
  harvestPlant,
  updateGrowingPlantBatchDetails,
  updateHarvestedPlantBatchDetails,
  updatePlantSeedInventory,
  updatePlantSensorInfo,
  verifyPlantExists,
  verifyPlantBatchIsGrowing,
};
