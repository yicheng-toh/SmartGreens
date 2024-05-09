const{ DEBUG } = require("../../../env.js");
const { createDbConnection } = require("./mssql.js");
const sql = require("mssql");

async function getAllPlantHarvestData() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  const query = `
            SELECT
                PlantInfo.PlantID,
                PlantInfo.PlantName,
                COALESCE(SUM(PlantBatch.WeightHarvested), 0) AS TotalWeightHavested
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
          DATEADD(DAY, pi.DaysToMature, pb.DatePlanted) AS ExpectedHarvestDate,
          pb.QuantityPlanted,
          pb.QuantityPlanted * pbs.YieldRate AS ExpectedYield
      FROM
          PlantBatch pb
      JOIN
          PlantInfo pi ON pb.PlantId = pi.PlantId
      JOIN
          PlantBatchSummary pbs ON pb.PlantId = pbs.PlantId;
    `;
  const queryResult = await request.query(plantBatchQuery);
  if (DEBUG) console.log("getAllPlantBatchInfoAndYield", queryResult);
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function getActivePlantBatchInfoAndYield() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try {
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
          pb.PlantId,
          pi.PlantName,
          pb.DatePlanted,
          pb.PlantLocation,
          m.MicrocontrollerId,
          DATEADD(DAY, pi.DaysToMature, pb.DatePlanted) AS ExpectedHarvestDate,
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
          Pb.DateHarvested IS NULL;
    `;
    // const plantBatchQuery = `
    //   WITH PlantBatchSummary AS (
    //     SELECT
    //         pb.PlantId,
    //         COALESCE(SUM(pb.WeightHarvested), 0) AS TotalHarvested,
    //         COALESCE(SUM(pb.QuantityPlanted), 0) AS TotalPlanted,
    //         COALESCE(SUM(pb.WeightHarvested) / NULLIF(SUM(pb.QuantityPlanted), 0), 0) AS YieldRate
    //     FROM
    //         PlantBatch pb
    //     WHERE
    //         pb.DatePlanted IS NOT NULL
    //         AND pb.DateHarvested IS NOT NULL
    //     GROUP BY
    //         pb.PlantId
    //   )

    //   SELECT
    //       pb.PlantBatchId,
    //       pb.PlantId,
    //       pi.PlantName,
    //       pb.DatePlanted,
    //       DATEADD(DAY, pi.DaysToMature, pb.DatePlanted) AS ExpectedHarvestDate,
    //       pb.QuantityPlanted
    //   FROM
    //       PlantBatch pb
    //   JOIN
    //       PlantInfo pi ON pb.PlantId = pi.PlantId
    //   WHERE
    //       Pb.DateHarvested IS NULL;
    // `;
    const queryResult = await request.query(plantBatchQuery);
    if (DEBUG) console.log("getActivePlantBatchInfoAndYield", queryResult);
    await dbConnection.disconnect();
    return queryResult.recordset;
  } catch (error) {
    if (DEBUG) console.log("Error in active plant batch and yield: ", error);
    await dbConnection.disconnect();
    throw error;
  }
}

async function getAllPlantInfo() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  //This may be depedent on what the frontend wants...
  queryResult = await request.query("SELECT * FROM PlantInfo;");
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function getAllPlantSeedInventory() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  queryResult = await request.query(
    "SELECT PlantId, PlantName, CurrentSeedInventory FROM PlantInfo;"
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
  queryResult = await request.query(yieldRateQuery);
  if (DEBUG) console.log(queryResult);
  await dbConnection.disconnect();
  return queryResult.recordset;
}

//may be required to insert images in the future.
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
async function harvestPlant(plantBatchId, dateHarvested, weightHarvested) {
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
  if (weightHarvested < 0) {
    return 0;
  }
  await request
    .input("weightHarvested", sql.Float, weightHarvested)
    .input("dateHarvested", sql.DateTime, dateHarvested)
    .query(
      "UPDATE PlantBatch SET WeightHarvested = @weightHarvested, DateHarvested = @dateHarvested WHERE PlantBatchId = @plantBatchId"
    );

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
  try{
  const originalQuantityResultList = await request
    .input("plantId", sql.Int, plantId)
    .query(
      "SELECT CurrentSeedInventory FROM PlantInfo WHERE PlantId = @plantId",
      plantId
    );
  // if (DEBUG) console.log(originalQuantityResultList);
  // if (DEBUG) console.log(originalQuantityResultList[0]);
  // if (DEBUG) console.log(!originalQuantityResultList[0]);
  // if (DEBUG) console.log(!originalQuantityResultList[0].length);
  // if (DEBUG) console.log(originalQuantityResultList[0][0]);
  if (DEBUG) console.log(originalQuantityResultList);
  if (DEBUG) console.log(originalQuantityResultList.recordset);
  if (DEBUG) console.log(originalQuantityResultList.recordset[0]);
  if (DEBUG) console.log(originalQuantityResultList.recordset[0].CurrentSeedInventory);
  if (DEBUG) console.log(originalQuantityResultList.recordset.length);
  if (!originalQuantityResultList.recordset.length) {
    if (DEBUG) console.log("nothing");
    return 0;
  }
  const originalQuantity =
    originalQuantityResultList.recordset[0].CurrentSeedInventory;
  if (quantityDecrement > originalQuantity) {
    if (DEBUG) console.log("not enuf");
    return 0;
  }

  const result = await request
    // .input("plantID", sql.Int, plantId)
    .input("plantLocation", sql.VarChar, plantLocation)
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
    .input("microcontrollerId", sql.VarChar, microcontrollerId)
    .input("plantBatchId", sql.Int, plantBatchId)
    .query(
      "SELECT COUNT(*) AS count FROM MicrocontrollerPlantbatchPair WHERE microcontrollerId = @microcontrollerId AND plantBatchId is NULL;"
    );

  const exists = checkIfExistsResult.recordset[0].count > 0;
  if (DEBUG) console.log("checkIfExistsResult.recordset", checkIfExistsResult.recordset);
  if (DEBUG) console.log("not sure if it exists", exists);
  if (exists) {
    // Update logic if the pair already exists
    await request
      //   .input("microcontrollerId", sql.Int, microcontrollerId)
      //   .input("plantBatchId", sql.Int, plantBatchId)
      .query(
        "UPDATE MicrocontrollerPlantbatchPair SET plantBatchId = @plantBatchId WHERE microcontrollerId = @microcontrollerId;"
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
  if (DEBUG) console.log("Ending the growplant function");
  return 1;
} catch (error){
  await dbConnection.disconnect();
  if (DEBUG) console.log(error);
  throw error;
}
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
  if (DEBUG) console.log(currentQuantityResult);
  if (DEBUG) console.log(currentQuantityResult.recordset);
  if (DEBUG) console.log(currentQuantityResult.recordset[0]);
  if (DEBUG) console.log(currentQuantityResult.recordset[0].CurrentSeedInventory);
  const currentQuantity =
    currentQuantityResult.recordset[0].CurrentSeedInventory;
  if (DEBUG) console.log("updating plant seed quantity ...", currentQuantity);
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

async function updatePlantSensorInfo(data) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try {
    // Check if the PlantId exists
    const result = await request
      .input("plantId", data.plantId)
      .query("SELECT * FROM PlantSensorInfo WHERE PlantId = @plantId");
    if (DEBUG) console.log("plant sensor info result is", result);
    if (DEBUG) console.log("plant sensor info result is", result.recordset);
    if (DEBUG) console.log("plant sensor info result is", result.recordset[0]);
    if (DEBUG) console.log("plant sensor info result is", result.recordset.length);
    if (result.recordset.length === 0) {
      // If PlantId does not exist, insert a new row
      await request
        // .input('plantId', data.plantId)
        .input("temperature_min", data.temperature_min)
        .input("temperature_max", data.temperature_max)
        .input("temperature_optimal", data.temperature_optimal)
        .input("humidity_min", data.humidity_min)
        .input("humidity_max", data.humidity_max)
        .input("humidity_optimal", data.humidity_optimal)
        .input("brightness_min", data.brightness_min)
        .input("brightness_max", data.brightness_max)
        .input("brightness_optimal", data.brightness_optimal)
        .input("pH_min", data.pH_min)
        .input("pH_max", data.pH_max)
        .input("pH_optimal", data.pH_optimal)
        .input("CO2_min", data.CO2_min)
        .input("CO2_max", data.CO2_max)
        .input("CO2_optimal", data.CO2_optimal)
        .input("EC_min", data.EC_min)
        .input("EC_max", data.EC_max)
        .input("EC_optimal", data.EC_optimal)
        .input("TDS_min", data.TDS_min)
        .input("TDS_max", data.TDS_max)
        .input("TDS_optimal", data.TDS_optimal).query(`
                  INSERT INTO PlantSensorInfo (
                      PlantId, 
                      Temperature_min, Temperature_max, Temperature_optimal,
                      Humidity_min, Humidity_max, Humidity_optimal,
                      Brightness_min, Brightness_max, Brightness_optimal,
                      pH_min, pH_max, pH_optimal,
                      CO2_min, CO2_max, CO2_optimal,
                      EC_min, EC_max, EC_optimal,
                      TDS_min, TDS_max, TDS_optimal
                  ) 
                  VALUES (
                      @plantId, 
                      @temperature_min, @temperature_max, @temperature_optimal,
                      @humidity_min, @humidity_max, @humidity_optimal,
                      @brightness_min, @brightness_max, @brightness_optimal,
                      @pH_min, @pH_max, @pH_optimal,
                      @CO2_min, @CO2_max, @CO2_optimal,
                      @EC_min, @EC_max, @EC_optimal,
                      @TDS_min, @TDS_max, @TDS_optimal
                  );
              `);
    } else {
      // If PlantId exists, update the existing row
      await // .input('plantId', data.plantId)
      request
        .input("temperature_min", data.temperature_min)
        .input("temperature_max", data.temperature_max)
        .input("temperature_optimal", data.temperature_optimal)
        .input("humidity_min", data.humidity_min)
        .input("humidity_max", data.humidity_max)
        .input("humidity_optimal", data.humidity_optimal)
        .input("brightness_min", data.brightness_min)
        .input("brightness_max", data.brightness_max)
        .input("brightness_optimal", data.brightness_optimal)
        .input("pH_min", data.pH_min)
        .input("pH_max", data.pH_max)
        .input("pH_optimal", data.pH_optimal)
        .input("CO2_min", data.CO2_min)
        .input("CO2_max", data.CO2_max)
        .input("CO2_optimal", data.CO2_optimal)
        .input("EC_min", data.EC_min)
        .input("EC_max", data.EC_max)
        .input("EC_optimal", data.EC_optimal)
        .input("TDS_min", data.TDS_min)
        .input("TDS_max", data.TDS_max)
        .input("TDS_optimal", data.TDS_optimal).query(`
                  UPDATE PlantSensorInfo SET 
                      Temperature_min = @temperature_min, Temperature_max = @temperature_max, Temperature_optimal = @temperature_optimal,
                      Humidity_min = @humidity_min, Humidity_max = @humidity_max, Humidity_optimal = @humidity_optimal,
                      Brightness_min = @brightness_min, Brightness_max = @brightness_max, Brightness_optimal = @brightness_optimal,
                      pH_min = @pH_min, pH_max = @pH_max, pH_optimal = @pH_optimal,
                      CO2_min = @CO2_min, CO2_max = @CO2_max, CO2_optimal = @CO2_optimal,
                      EC_min = @EC_min, EC_max = @EC_max, EC_optimal = @EC_optimal,
                      TDS_min = @TDS_min, TDS_max = @TDS_max, TDS_optimal = @TDS_optimal
                  WHERE PlantId = @plantId;
              `);
    }

    // Return true indicating successful update
    await dbConnection.disconnect();
    return 1;
  } catch (error) {
    console.error("Error updating PlantSensorInfo:", error);
    return 0; // Return false indicating update failure
  }
}

async function updatePlantInfo(data) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try {
    // Check if the PlantId should already exist.
    const result = await request
      .input("plantId", data.plantId)
      .query("SELECT * FROM PlantInfo WHERE PlantId = @plantId");
    if (DEBUG) console.log("plant sensor info result is", result);
    if (DEBUG) console.log("plant sensor info result is", result.recordset);
    if (DEBUG) console.log("plant sensor info result is", result.recordset[0]);
    if (DEBUG) console.log("plant sensor info result is", result.recordset.length);
    if (result.recordset.length === 0) {
      // If PlantId does not exist, insert a new row
      await request
        // .input('plantId', data.plantId)
        .input("temperature_min", data.temperature_min)
        .input("temperature_max", data.temperature_max)
        .input("temperature_optimal", data.temperature_optimal)
        .input("humidity_min", data.humidity_min)
        .input("humidity_max", data.humidity_max)
        .input("humidity_optimal", data.humidity_optimal)
        .input("brightness_min", data.brightness_min)
        .input("brightness_max", data.brightness_max)
        .input("brightness_optimal", data.brightness_optimal)
        .input("pH_min", data.pH_min)
        .input("pH_max", data.pH_max)
        .input("pH_optimal", data.pH_optimal)
        .input("CO2_min", data.CO2_min)
        .input("CO2_max", data.CO2_max)
        .input("CO2_optimal", data.CO2_optimal)
        .input("EC_min", data.EC_min)
        .input("EC_max", data.EC_max)
        .input("EC_optimal", data.EC_optimal)
        .input("TDS_min", data.TDS_min)
        .input("TDS_max", data.TDS_max)
        .input("TDS_optimal", data.TDS_optimal).query(`
                  INSERT INTO PlantSensorInfo (
                      PlantId, 
                      Temperature_min, Temperature_max, Temperature_optimal,
                      Humidity_min, Humidity_max, Humidity_optimal,
                      Brightness_min, Brightness_max, Brightness_optimal,
                      pH_min, pH_max, pH_optimal,
                      CO2_min, CO2_max, CO2_optimal,
                      EC_min, EC_max, EC_optimal,
                      TDS_min, TDS_max, TDS_optimal
                  ) 
                  VALUES (
                      @plantId, 
                      @temperature_min, @temperature_max, @temperature_optimal,
                      @humidity_min, @humidity_max, @humidity_optimal,
                      @brightness_min, @brightness_max, @brightness_optimal,
                      @pH_min, @pH_max, @pH_optimal,
                      @CO2_min, @CO2_max, @CO2_optimal,
                      @EC_min, @EC_max, @EC_optimal,
                      @TDS_min, @TDS_max, @TDS_optimal
                  );
              `);
    } else {
      // If PlantId exists, update the existing row
      await // .input('plantId', data.plantId)
      request
        .input("temperature_min", data.temperature_min)
        .input("temperature_max", data.temperature_max)
        .input("temperature_optimal", data.temperature_optimal)
        .input("humidity_min", data.humidity_min)
        .input("humidity_max", data.humidity_max)
        .input("humidity_optimal", data.humidity_optimal)
        .input("brightness_min", data.brightness_min)
        .input("brightness_max", data.brightness_max)
        .input("brightness_optimal", data.brightness_optimal)
        .input("pH_min", data.pH_min)
        .input("pH_max", data.pH_max)
        .input("pH_optimal", data.pH_optimal)
        .input("CO2_min", data.CO2_min)
        .input("CO2_max", data.CO2_max)
        .input("CO2_optimal", data.CO2_optimal)
        .input("EC_min", data.EC_min)
        .input("EC_max", data.EC_max)
        .input("EC_optimal", data.EC_optimal)
        .input("TDS_min", data.TDS_min)
        .input("TDS_max", data.TDS_max)
        .input("TDS_optimal", data.TDS_optimal).query(`
                  UPDATE PlantSensorInfo SET 
                      Temperature_min = @temperature_min, Temperature_max = @temperature_max, Temperature_optimal = @temperature_optimal,
                      Humidity_min = @humidity_min, Humidity_max = @humidity_max, Humidity_optimal = @humidity_optimal,
                      Brightness_min = @brightness_min, Brightness_max = @brightness_max, Brightness_optimal = @brightness_optimal,
                      pH_min = @pH_min, pH_max = @pH_max, pH_optimal = @pH_optimal,
                      CO2_min = @CO2_min, CO2_max = @CO2_max, CO2_optimal = @CO2_optimal,
                      EC_min = @EC_min, EC_max = @EC_max, EC_optimal = @EC_optimal,
                      TDS_min = @TDS_min, TDS_max = @TDS_max, TDS_optimal = @TDS_optimal
                  WHERE PlantId = @plantId;
              `);
    }

    // Return true indicating successful update
    await dbConnection.disconnect();
    return true;
  } catch (error) {
    console.error("Error updating PlantSensorInfo:", error);
    return false; // Return false indicating update failure
  }
}

async function getAllPlantBatchInfo() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  queryResult = await request.query(
    `SELECT 
        PlantBatch.PlantBatchId,
        PlantBatch.PlantId,
        PlantBatch.PlantLocation,
        PlantBatch.QuantityPlanted,
        PlantBatch.WeightHarvested,
        PlantBatch.DatePlanted,
        PlantBatch.DateHarvested,
        PlantInfo.PlantName,
        PlantInfo.PlantPicture,
        PlantInfo.SensorsRanges,
        PlantInfo.DaysToMature,
        PlantInfo.CurrentSeedInventory,
        PlantInfo.TotalHarvestSold,
        PlantInfo.TotalHarvestDiscarded
       FROM PlantBatch 
      LEFT JOIN 
        PlantInfo ON PlantInfo.PlantID = PlantBatch.PlantID`
  );
  await dbConnection.disconnect();
  return queryResult.recordset;
}

async function verifyPlantBatchIsGrowing(plantBatchId) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try {
    let result = await request
      .input("plantBatchId", sql.Int, plantBatchId)
      .query("SELECT * FROM PlantBatch WHERE PlantBatchId = @plantBatchId;");
    if (DEBUG) console.log("verifyPlantBatchIsGrowing", result.recordset);
    if (DEBUG) console.log("verifyPlantBatchIsGrowing", result.recordset[0]);
    if (DEBUG) console.log("verifyPlantBatchIsGrowing", result.recordset[0].DateHarvested);
    if (!result.recordset[0].DatePlanted) {
      await dbConnection.disconnect();
      return 0;
    }
    if (result.recordset[0].DateHarvested !== null) {
      if (DEBUG) console.log(
        "verifyPlantBatchIsGrowing",
        result.recordset[0].DateHarvested
      );
      await dbConnection.disconnect();
      return 0;
    }
    await dbConnection.disconnect();
    return 1;
  } catch (error) {
    console.error("Error verifying plant batch:", error);
    await dbConnection.disconnect();
    throw error;
  }
}

async function updateGrowingPlantBatchDetails(
  plantBatchId,
  plantId,
  datePlanted,
  quantityPlanted,
  location
) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try {
    const result = await request
      .input("datePlanted", sql.DateTime, datePlanted)
      .input("quantityPlanted", sql.Int, quantityPlanted)
      .input("plantBatchId", sql.Int, plantBatchId)
      .input("location", sql.VarChar, location)
      .input("plantId", sql.Int, plantId)
      .query(
        "UPDATE PlantBatch SET DatePlanted = @datePlanted, QuantityPlanted = @quantityPlanted, PlantLocation = @location, PlantId = @plantId WHERE PlantBatchId = @plantBatchId;"
      );
    if (DEBUG) console.log("updateGrowingPlantBatchDetails", result.rowsAffected);
    await dbConnection.disconnect();
    return 1;
  } catch (error) {
    console.error("Error updating growing plant batch details:", error);
    await dbConnection.disconnect();
    throw error;
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
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const result = await request
      .input("datePlanted", sql.DateTime, datePlanted)
      .input("quantityPlanted", sql.Int, quantityPlanted)
      .input("dateHarvested", sql.DateTime, dateHarvested)
      .input("weightHarvested", sql.Int, weightHarvested)
      .input("plantBatchId", sql.Int, plantBatchId)
      .input("plantId", sql.Int, plantId)
      .input("location", sql.VarChar, location)
      .query(
        `UPDATE PlantBatch SET DatePlanted = @datePlanted, QuantityPlanted = @quantityPlanted, 
        DateHarvested = @dateHarvested, WeightHarvested = @weightHarvested, PlantLocation = @location, 
        PlantId = @plantId 
        WHERE PlantBatchId = @plantBatchId;`
      );
    if (DEBUG) console.log("updateHarvestedPlantBatchDetails", result.rowsAffected);
    await dbConnection.disconnect();
    return 1; // Successful update
  } catch (error) {
    console.error("Error updating growing plant batch details:", error);
    await dbConnection.disconnect();
    return 0; // Return 0 to indicate failure
  }
}

async function deletePlantBatch(plantBatchId) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try {
    const deleteSensorReadingsQuery = `
      DELETE FROM SensorReadings
      WHERE PlantBatchId = @plantBatchId;
    `;
    await request
      .input("plantBatchId", sql.Int, plantBatchId)
      .query(deleteSensorReadingsQuery);

    // Delete entry from PlantBatch table
    const deletePlantBatchQuery = `
      DELETE FROM PlantBatch
      WHERE PlantBatchId = @plantBatchId;
    `;
    await request.query(deletePlantBatchQuery);
    await dbConnection.disconnect();
    return 1;
  } catch (error) {
    console.error("Error deleting plant batch data", error);
    await dbConnection.disconnect();
    throw error;
  }
}

async function updatePlantInfo(
  plantId,
  plantName,
  plantPicture,
  daysToMature,
  currentSeedInventory
) {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try {
    const sqlQuery = `
      UPDATE PlantInfo
      SET PlantName = @plantName, PlantPicture = @plantPicture, DaysToMature = @daysToMature, CurrentSeedInventory = @currentSeedInventory
      WHERE PlantId = @plantId;
    `;
    await request
      .input("plantName", sql.NVarChar, plantName)
      .input("plantPicture", sql.VarBinary(sql.MAX), plantPicture)
      .input("daysToMature", sql.Int, daysToMature)
      .input("currentSeedInventory", sql.Int, currentSeedInventory)
      .input("plantId", sql.Int, plantId)
      .query(sqlQuery);
    await dbConnection.disconnect();
    return 1;
  } catch (error) {
    console.error("Error updating data: ", error);
    await dbConnection.disconnect();
    throw error;
  }
}

async function getAllHarvestedPlantBatchInfo() {
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try {
    const result = await request.query(`
    SELECT 
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
    WHERE pb.DateHarvested is NOT NULL;
    `);
    await dbConnection.disconnect();
    return result.recordset;
  } catch (error) {
    if (DEBUG) console.log("Error in function getAllHarvestedPlantBatchInfo", error);
    await dbConnection.disconnect();
    throw error;
  }
}

async function getAllPlantYieldRateByMonth(){
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try{
    const sqlQuery = `
        SELECT 
        pb.plantId,
        pi.plantName,
        YEAR(DateHarvested) AS year,
        FORMAT(DateHarvested, 'MMMM') AS month,
        SUM(weightHarvested) AS total_weight_harvested
      FROM PlantBatch pb
      JOIN PlantInfo pi ON pi.PlantId = pb.PlantId
      WHERE DateHarvested >= 
        CASE 
          WHEN DAY(GETDATE()) = 1 THEN DATEADD(MONTH, -11, DATEADD(DAY, 1, EOMONTH(GETDATE())))
          ELSE DATEADD(DAY, 1 - DAY(GETDATE()), GETDATE())
        END
      AND DateHarvested <= DATEADD(HOUR, 8, GETDATE()) -- for gmt + 8
      GROUP BY pb.plantId, pi.plantName, YEAR(DateHarvested), FORMAT(DateHarvested, 'MMMM')
      ORDER BY pb.plantId, YEAR(DateHarvested), FORMAT(DateHarvested, 'MMMM');
    `;
    const sqlQuery2 = `SELECT 
    pb.plantId,
    pi.plantName,
    YEAR(DateHarvested) AS year,
    DATENAME(MONTH, DateHarvested) AS month,
    SUM(weightHarvested) AS total_weight_harvested
FROM PlantBatch pb
JOIN PlantInfo pi ON pi.PlantId = pb.PlantId
WHERE DateHarvested >= 
    DATEADD(MONTH, -11, DATEADD(DAY, 1 - DAY(GETDATE()), GETDATE())) -- Adjust start date
AND DateHarvested <= DATEADD(HOUR, 8, GETDATE()) -- Adjust end date for GMT + 8
GROUP BY pb.plantId, pi.plantName, YEAR(DateHarvested), DATENAME(MONTH, DateHarvested)
ORDER BY pb.plantId, YEAR(DateHarvested), DATENAME(MONTH, DateHarvested);
`;
    let result = await request.query(sqlQuery2);
    if (DEBUG) console.log("getAllPlantYieldRateByMonth:", result);
    await dbConnection.disconnect();
    return result.recordset;
  }catch(error){
    await dbConnection.disconnect();
    if (DEBUG) console.log("Error in function getAllHarvestedPlantBatchInfo", error);
    throw error;
  }
}

async function getAllPlantYieldRateByWeek(){
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try{
    const sqlQuery = `
    SELECT 
    pb.plantId,
    pi.plantName,
    YEAR(DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested)) AS year,
    (DATEPART(WEEK, DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested)) - DATEPART(WEEK, GETDATE()) + 12) AS weekNumber,
    SUM(weightHarvested) AS total_weight_harvested
FROM PlantBatch pb
JOIN PlantInfo pi ON pi.PlantId = pb.PlantId
WHERE DateHarvested >= DATEADD(WEEK, -11, CAST(GETDATE() AS DATE))
  AND DateHarvested <= DATEADD(HOUR, 8, GETDATE())
GROUP BY pb.plantId, pi.plantName, YEAR(DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested)), DATEPART(WEEK, DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested))
ORDER BY pb.plantId, YEAR(DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested)), weekNumber;

    `;
//     const sqlQuery = `
//     SELECT 
//     pb.plantId,
//     pi.plantName,
//     YEAR(DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested)) AS year,
//     DATEPART(WEEK, DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested)) AS weekNumber,
//     SUM(weightHarvested) AS total_weight_harvested
// FROM PlantBatch pb
// JOIN PlantInfo pi ON pi.PlantId = pb.PlantId
// WHERE DateHarvested >= DATEADD(WEEK, -9, CAST(GETDATE() AS DATE))
//   AND DateHarvested <= DATEADD(HOUR, 8, GETDATE())
// GROUP BY pb.plantId, pi.plantName, YEAR(DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested)), DATEPART(WEEK, DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested))
// ORDER BY pb.plantId, YEAR(DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested)), DATEPART(WEEK, DATEADD(DAY, 1 - DATEPART(WEEKDAY, DateHarvested), DateHarvested));

//     `;
    let result = await request.query(sqlQuery);
    await dbConnection.disconnect();
    return result.recordset;
  }catch(error){
    await dbConnection.disconnect();
    if (DEBUG) console.log("Error in function getAllHarvestedPlantBatchInfo", error);
    throw error;
  }
}

async function getAllActiveLatestImage(){
  const dbConnection = await createDbConnection();
  const request = await dbConnection.connect();
  try{
    const sqlQuery = `
    SELECT 
    PlantBatchId,
    LatestImage,
    CurrentPlantHealthStatus,
    LastImageUpdateDateTime,	
    ExpectedYield 
    from PlantBatch WHERE DateHarvested is NULL;`;
    let result;
    try{
      result = await request.query(sqlQuery);
    } catch (error){
      console.log(error);
      result = await request.query(sqlQuery);
    }
    
    await dbConnection.disconnect();
    return result.recordset;


  }catch (error){
    await dbConnection.disconnect();
    if (DEBUG) console.log("Error in function getAllActiveLatestImage", error);
    throw error;

  }

}

module.exports = {
  deletePlantBatch,
  getAllPlantHarvestData,
  // updatePlantHarvestData,
  getAllPlantBatchInfoAndYield,
  getActivePlantBatchInfoAndYield,
  getAllPlantBatchInfo,
  getAllPlantInfo,
  getAllPlantYieldRate,
  getAllPlantYieldRateByMonth,
  getAllPlantYieldRateByWeek,
  insertNewPlant,
  getAllPlantSeedInventory,
  getAllHarvestedPlantBatchInfo,
  getAllActiveLatestImage,
  growPlant,
  harvestPlant,
  updatePlantSensorInfo,
  updatePlantInfo,
  updatePlantSeedInventory,
  updateGrowingPlantBatchDetails,
  updateHarvestedPlantBatchDetails,
  verifyPlantBatchIsGrowing,
  verifyPlantExists,
};
