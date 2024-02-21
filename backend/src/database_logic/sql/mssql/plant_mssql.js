const { createDbConnection } = require("./mssql.js");
const sql = require("mssql");

async function getAllPlantHarvestData() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
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
  const queryResult = await request.query(query);
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function getAllPlantBatchInfoAndYield() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
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
        DATEADD(DAY, pi.DaysToMature, pb.DatePlanted) AS ExpectedHarvestDate,
        pb.QuantityPlanted,
        pbs.YieldRate
    FROM
        PlantBatch pb
    JOIN
        PlantInfo pi ON pb.PlantId = pi.PlantId
    JOIN
        PlantBatchSummary pbs ON pb.PlantId = pbs.PlantId;
  `;  
const queryResult = await request.query(plantBatchQuery);
  console.log(queryResult);
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function getAllPlantInfo() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  //This may be depedent on what the frontend wants...
  queryResult = await request.query("SELECT * FROM PlantInfo");
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function getAllPlantSeedInventory() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  queryResult = await request.query(
    "SELECT PlantId, PlantName, CurrentSeedInventory FROM PlantInfo"
  );
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function getAllPlantYieldRate() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
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
  queryResult = await request.query(yieldRateQuery);
  console.log(queryResult);
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function insertNewPlant(plantName, SensorsRanges, DaysToMature) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  await request
    .input("plantName", sql.VarChar(255), plantName)
    .input("SensorsRanges", sql.Int, SensorsRanges)
    .input("DaysToMature", sql.Int, DaysToMature)
    .query(
      "INSERT INTO PlantInfo (PlantName, SensorsRanges, DaysToMature) VALUES (@plantName, @SensorsRanges, @DaysToMature); SELECT SCOPE_IDENTITY() AS newPlantId"
    );
  await dbConnection.disconnect();
  return 1;
}

//This function may need to be broken up in the routes for error catching.
//Todo 22 jan: to update the microcontroller batch pair table too.
async function harvestPlant(plantBatchId, quantityHarvested) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  //need to check the number of seeds planted.
  const quantitySeedPlantedResultList = await request
    .input("plantBatchId", sql.Int, plantBatchId)
    .query(
      "SELECT QuantityPlanted from PlantBatch WHERE PlantBatchId = @plantBatchId"
    );
  if (!quantitySeedPlantedResultList.recordset.length) {
    return 0;
  }
  const quantitySeedPlanted =
    quantitySeedPlantedResultList.recordset[0].QuantityPlanted;
  if (quantityHarvested > quantitySeedPlanted) {
    return 0;
  }
  await request
    .input("quantityHarvested", sql.Int, quantityHarvested)
    // .input("plantBatchId", sql.Int, plantBatchId)
    .query(
      "UPDATE PlantBatch SET QuantityHarvested = @quantityHarvested WHERE PlantBatchId = @plantBatchId"
    );

  // const plantIdResultList = await request.query('SELECT plantId FROM PlantBatch WHERE plantBatch = @plantBatch');

  // const plantId = plantIdResultList[0].plantId;

  // await updatePlantHarvestData(plantId, quantityHarvested);
  await request
    // .input("plantBatchId", sql.Int, plantBatchId)
    .query(
      "UPDATE MicrocontrollerPlantBatchPair SET plantBatchId = NULL WHERE plantBatchId = @plantBatchId"
    );
  await dbConnection.disconnect();
  return 1;
}

//This function may need to be broken up in the routes for error catching.
//the variables used can be discussed with the frontend if efficiency can be an issue.
//This has issue with my sql. please test this function thoroughly.
async function growPlant(
  plantId,
  plantLocation,
  microcontrollerId,
  quantityDecrement,
  datePlanted
) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();

  const originalQuantityResultList = await request
    .input("plantId", sql.Int, plantId)
    .query(
      "SELECT CurrentSeedInventory FROM PlantInfo WHERE PlantId = @plantId",
      plantId
    );
  // console.log(originalQuantityResultList);
  // console.log(originalQuantityResultList[0]);
  // console.log(!originalQuantityResultList[0]);
  // console.log(!originalQuantityResultList[0].length);
  // console.log(originalQuantityResultList[0][0]);
  console.log(originalQuantityResultList);
  console.log(originalQuantityResultList.recordset);
  console.log(originalQuantityResultList.recordset[0]);
  console.log(originalQuantityResultList.recordset[0].CurrentSeedInventory);
  console.log(originalQuantityResultList.recordset.length);
  if (!originalQuantityResultList.recordset.length) {
    console.log("nothing");
    return 0;
  }
  const originalQuantity =
    originalQuantityResultList.recordset[0].CurrentSeedInventory;
  if (quantityDecrement > originalQuantity) {
    console.log("not enuf");
    return 0;
  }

  const result = await request
    // .input("plantID", sql.Int, plantId)
    .input("plantLocation", sql.Int, plantLocation)
    .input("quantityPlanted", sql.Int, quantityDecrement)
    .input("datePlanted", sql.DateTime, datePlanted)
    .query(
      "INSERT INTO PlantBatch (plantID, plantLocation, quantityPlanted, datePlanted) VALUES (@plantID, @plantLocation, @quantityPlanted, @datePlanted); SELECT SCOPE_IDENTITY() AS plantBatchId"
    );

  const plantBatchId = result.recordset[0].plantBatchId;

  const updatedQuantity = originalQuantity - quantityDecrement;

  await request
    .input("updatedQuantity", sql.Int, updatedQuantity)
    // .input('plantId', sql.Int, plantId)
    .query(
      "UPDATE PlantInfo SET CurrentSeedInventory = @updatedQuantity WHERE plantId = @plantId"
    );

  // await request
  //     .input('microcontrollerId', sql.Int, microcontrollerId)
  //     .input('plantBatchId', sql.Int, plantBatchId)
  //     .query('INSERT INTO MicrocontrollerPlantbatchPair (microcontrollerId, plantBatchId) VALUES (@microcontrollerId, @plantBatchId) ON DUPLICATE KEY UPDATE microcontrollerId = VALUES(microcontrollerId), column2 = VALUES(plantBatch)');

  // Insert or Update MicrocontrollerPlantbatchPair
  const checkIfExistsResult = await request
    .input("microcontrollerId", sql.Int, microcontrollerId)
    .input("plantBatchId", sql.Int, plantBatchId)
    .query(
      "SELECT COUNT(*) AS count FROM MicrocontrollerPlantbatchPair WHERE microcontrollerId = @microcontrollerId AND plantBatchId = @plantBatchId"
    );

  const exists = checkIfExistsResult.recordset[0].count > 0;
  console.log("not sure if it exists", exists);
  if (exists) {
    // Update logic if the pair already exists
    await request
      //   .input("microcontrollerId", sql.Int, microcontrollerId)
      //   .input("plantBatchId", sql.Int, plantBatchId)
      .query(
        "UPDATE MicrocontrollerPlantbatchPair SET microcontrollerId = @microcontrollerId WHERE plantBatchId = @plantBatchId"
      );
  } else {
    // Insert logic if the pair doesn't exist
    await request
      //   .input("microcontrollerId", sql.Int, microcontrollerId)
      //   .input("plantBatchId", sql.Int, plantBatchId)
      .query(
        "INSERT INTO MicrocontrollerPlantbatchPair (microcontrollerId, plantBatchId) VALUES (@microcontrollerId, @plantBatchId)"
      );
  }

  await dbConnection.disconnect();
  console.log("Ending the growplant function");
  return 1;
}

// async function updatePlantHarvestData(plantId, quantityChange){
//     const dbConnection = await createDbConnection();
//     const request = await dbConnection.connect();

//     const currentQuantityResult = await request
//         .input('plantId', sql.Int, plantId)
//         .query('SELECT quantity FROM PlantHarvest WHERE PlantId = @plantId');

//     const currentQuantity = currentQuantityResult.recordset[0].quantity;
//     const newQuantity = currentQuantity + quantityChange;

//     await request
//         .input('newQuantity', sql.Int, newQuantity)
//         .input('plantId', sql.Int, plantId)
//         .query('UPDATE PlantHarvest SET quantity = @newQuantity WHERE plant_id = @plantId');

//     await dbConnection.disconnect();
//     return 1;

// }

async function updatePlantSeedInventory(plantId, quantityChange) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  const currentQuantityResult = await request
    .input("plantId", sql.Int, plantId)
    .query(
      "SELECT CurrentSeedInventory FROM PlantInfo WHERE PlantId = @plantId"
    );
  console.log(currentQuantityResult);
  console.log(currentQuantityResult.recordset);
  console.log(currentQuantityResult.recordset[0]);
  console.log(currentQuantityResult.recordset[0].CurrentSeedInventory);
  const currentQuantity =
    currentQuantityResult.recordset[0].CurrentSeedInventory;
  console.log("updating plant seed quantity ...", currentQuantity);
  const newQuantity = currentQuantity + quantityChange;

  await request
    .input("newQuantity", sql.Int, newQuantity)
    // .input('plantId', sql.Int, plantId)
    .query(
      "UPDATE PlantInfo SET CurrentSeedInventory = @newQuantity WHERE plantId = @plantId"
    );

  await dbConnection.disconnect();
  return 1;
}

async function verifyPlantExists(plantId) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();

  const plantIdList = await request
    .input("plantId", sql.Int, plantId)
    .query("SELECT id FROM PlantInfo WHERE PlantID = @plantId");

  await dbConnection.disconnect();
  return plantIdList.recordset.length;
}

//need to rethink on how to write the functions......write them based on sql queries... or....
//there is no harvest plant info. i.e. no logic to harvest plant.

module.exports = {
  getAllPlantHarvestData,
  // updatePlantHarvestData,
  getAllPlantBatchInfoAndYield,
  getAllPlantInfo,
  getAllPlantYieldRate,
  insertNewPlant,
  getAllPlantSeedInventory,
  growPlant,
  harvestPlant,
  updatePlantSeedInventory,
  verifyPlantExists,
};
