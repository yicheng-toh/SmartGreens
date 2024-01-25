const {createDbConnection} = require("./mssql.js");
const sql = require("mssql");



async function getAllPlantHarvestData(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const query =  `
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

async function getAllPlantInfo(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    //This may be depedent on what the frontend wants...
    queryResult = await request.query('SELECT * FROM PlantInfo');
    await dbConnection.disconnect();
    return queryResult.recordset;
}

async function getAllPlantSeedInventory(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT CurrentSeedInventory FROM PlantInfo');
    await dbConnection.disconnect();
    return queryResult.recordset;
}

async function insertNewPlant(plantName,SensorsRanges,DaysToMature){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    await request
        .input('plantName', sql.NVarChar(255), plantName)
        .input('SensorsRanges', sql.NVarChar(255), SensorsRanges)
        .input('DaysToMature', sql.Int, DaysToMature)
        .query('INSERT INTO PlantInfo (PlantName, SensorsRanges, DaysToMature) VALUES (@plantName, @SensorsRanges, @DaysToMature); SELECT SCOPE_IDENTITY() AS newPlantId');
    await dbConnection.disconnect();
    return 1;
}

//This function may need to be broken up in the routes for error catching.
//Todo 22 jan: to update the microcontroller batch pair table too.
async function harvestPlant(plantBatchId, quantityHarvested){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    await request
        .input('quantityHarvested', sql.Int, quantityHarvested)
        .input('plantBatchId', sql.Int, plantBatchId)
        .query('UPDATE PlantBatch SET QuantityHarvested = @quantityHarvested WHERE PlantBatchId = @plantBatchId');

    // const plantIdResultList = await request.query('SELECT plantId FROM PlantBatch WHERE plantBatch = @plantBatch');

    // const plantId = plantIdResultList[0].plantId;

    // await updatePlantHarvestData(plantId, quantityHarvested);
    await request
    .input('plantId', sql.Int, plantId)
    .query('UPDATE MicrocontrollerPlantBatchPair SET plantId = NULL WHERE plantid = @plantId');
    await dbConnection.disconnect();
    return 1;
}

//This function may need to be broken up in the routes for error catching.
//the variables used can be discussed with the frontend if efficiency can be an issue.
//This has issue with my sql. please test this function thoroughly.
async function growPlant(plantId, plantLocation, microcontrollerId, quantityDecrement, datePlanted){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const result = await request
        .input('plantID', sql.Int, plantId)
        .input('plantLocation', sql.NVarChar(255), plantLocation)
        .input('quantityPlanted', sql.Int, quantityDecrement)
        .input('datePlanted', sql.DateTime, datePlanted)
        .query('INSERT INTO PlantBatch (plantID, plantLocation, quantityPlanted, datePlanted) VALUES (@plantID, @plantLocation, @quantityPlanted, @datePlanted); SELECT SCOPE_IDENTITY() AS plantBatchId');

    const plantBatchId = result.recordset[0].plantBatchId;

    const originalQuantityResultList = await request
        .input('plantId', sql.Int, plantId)
        .query('SELECT CurrentSeedInventory FROM PlantInfo WHERE PlantId = @plantId');

    const originalQuantity = originalQuantityResultList[0].quantity;
    const updatedQuantity = originalQuantity - quantityDecrement;

    await request
        .input('updatedQuantity', sql.Int, updatedQuantity)
        .input('plantId', sql.Int, plantId)
        .query('UPDATE PlantInfo SET CurrentSeedInventory = @updatedQuantity WHERE plantId = @plantId');

    await request
        .input('microcontrollerId', sql.Int, microcontrollerId)
        .input('plantBatchId', sql.Int, plantBatchId)
        .query('INSERT INTO MicrocontrollerPlantbatchPair (microcontrollerId, plantBatchId) VALUES (@microcontrollerId, @plantBatchId) ON DUPLICATE KEY UPDATE microcontrollerId = VALUES(microcontrollerId), column2 = VALUES(plantBatch)');

    await dbConnection.disconnect();
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

async function updatePlantSeedInventory(plantId, quantityChange){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const currentQuantityResult = await request
        .input('plantId', sql.Int, plantId)
        .query('SELECT CurrentSeedInventory FROM PlantInfo WHERE PlantId = @plantId');

    const currentQuantity = currentQuantityResult.recordset[0].quantity;
    const newQuantity = currentQuantity + quantityChange;

    await request
        .input('newQuantity', sql.Int, newQuantity)
        .input('plantId', sql.Int, plantId)
        .query('UPDATE PlantInfo SET CurrentSeedInventory = @newQuantity WHERE plantId = @plantId');

    await dbConnection.disconnect();
    return 1;
}

async function verifyPlantExists(plantId){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();

    const plantIdList = await request
        .input('plantId', sql.Int, plantId)
        .query('SELECT id FROM PlantInfo WHERE PlantID = @plantId');

    await dbConnection.disconnect();
    return plantIdList.recordset.length;
}

//need to rethink on how to write the functions......write them based on sql queries... or....
//there is no harvest plant info. i.e. no logic to harvest plant.


module.exports = {
    getAllPlantHarvestData,
    // updatePlantHarvestData,
    getAllPlantInfo,
    insertNewPlant,
    getAllPlantSeedInventory,
    growPlant,
    harvestPlant,
    updatePlantSeedInventory,
    verifyPlantExists,
}
