const {createDbConnection} = require("./mssql.js");
const sql = require("mssql");



async function getAllPlantHarvestData(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const queryResult = await request.query('SELECT * FROM PlantHarvest');
    await dbConnection.disconnect();
    return queryResult;
}

async function getAllPlantInfo(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM PlantInfo');
    await dbConnection.disconnect();
    return queryResult;
}

async function getAllPlantSeedInventory(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    queryResult = await request.query('SELECT * FROM PlantSeedInventory');
    await dbConnection.disconnect();
    return queryResult;
}

async function insertNewPlant(plantName,SensorsRanges,DaysToMature){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    await request
        .input('plantName', sql.NVarChar(255), plantName)
        .input('SensorsRanges', sql.NVarChar(255), SensorsRanges)
        .input('DaysToMature', sql.Int, DaysToMature)
        .query('INSERT INTO PlantInfo (PlantName, SensorsRanges, DaysToMature) VALUES (@plantName, @SensorsRanges, @DaysToMature); SELECT SCOPE_IDENTITY() AS newPlantId');
    const newPlantId = result.recordset[0].newPlantId;   

    
    await request
        .input('newPlantId', sql.Int, newPlantId)
        .query('INSERT INTO PlantHarvest (PlantID, Quantity) VALUES (@newPlantId, 0)');

    await request
        .input('newPlantId', sql.Int, newPlantId)
        .query('INSERT INTO PlantSeedInventory (PlantID, Quantity) VALUES (@newPlantId, 0)');

    await dbConnection.disconnect();
    return 1;
}

//This function may need to be broken up in the routes for error catching.
async function harvestPlant(plantBatch, quantityHarvested){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    await request
        .input('quantityHarvested', sql.Int, quantityHarvested)
        .input('plantBatch', sql.Int, plantBatch)
        .query('UPDATE PlantBatch SET quantityHarvested = @quantityHarvested WHERE plantBatch = @plantBatch');

    const plantIdResultList = await request.query('SELECT plantId FROM PlantBatch WHERE plantBatch = @plantBatch');

    const plantId = plantIdResultList[0].plantId;

    await updatePlantHarvestData(plantId, quantityHarvested);

    await dbConnection.disconnect();
    return 1;
}

//This function may need to be broken up in the routes for error catching.
async function growPlant(plantId, plantLocation, microcontrollerId, quantityDecrement){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const result = await request
        .input('plantID', sql.Int, plantId)
        .input('plantLocation', sql.NVarChar(255), plantLocation)
        .input('quantityPlanted', sql.Int, quantityDecrement)
        .query('INSERT INTO PlantBatch (plantID, plantLocation, quantityPlanted) VALUES (@plantID, @plantLocation, @quantityPlanted); SELECT SCOPE_IDENTITY() AS plantBatchId');

    const plantBatchId = result.recordset[0].plantBatchId;

    const originalQuantityResultList = await request
        .input('plantId', sql.Int, plantId)
        .query('SELECT quantity FROM PlantSeedInventory WHERE PlantId = @plantId');

    const originalQuantity = originalQuantityResultList[0].quantity;
    const updatedQuantity = originalQuantity - quantityDecrement;

    await request
        .input('updatedQuantity', sql.Int, updatedQuantity)
        .input('plantId', sql.Int, plantId)
        .query('UPDATE PlantSeedInventory SET quantity = @updatedQuantity WHERE plant_id = @plantId');

    await request
        .input('microcontrollerId', sql.Int, microcontrollerId)
        .input('plantBatchId', sql.Int, plantBatchId)
        .query('INSERT INTO MicrocontrollerPlantbatchPair (microcontrollerId, plantBatch) VALUES (@microcontrollerId, @plantBatchId) ON DUPLICATE KEY UPDATE microcontrollerId = VALUES(microcontrollerId), column2 = VALUES(plantBatch)');

    await dbConnection.disconnect();
    return 1;
}

async function updatePlantHarvestData(plantId, quantityChange){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    
    const currentQuantityResult = await request
        .input('plantId', sql.Int, plantId)
        .query('SELECT quantity FROM PlantHarvest WHERE PlantId = @plantId');

    const currentQuantity = currentQuantityResult[0].quantity;
    const newQuantity = currentQuantity + quantityChange;

    await request
        .input('newQuantity', sql.Int, newQuantity)
        .input('plantId', sql.Int, plantId)
        .query('UPDATE PlantHarvest SET quantity = @newQuantity WHERE plant_id = @plantId');

    await dbConnection.disconnect();
    return 1;

}

async function updatePlantSeedInventory(plantId, quantityChange){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const currentQuantityResult = await request
        .input('plantId', sql.Int, plantId)
        .query('SELECT quantity FROM PlantSeedInventory WHERE PlantId = @plantId');

    const currentQuantity = currentQuantityResult[0].quantity;
    const newQuantity = currentQuantity + quantityChange;

    await request
        .input('newQuantity', sql.Int, newQuantity)
        .input('plantId', sql.Int, plantId)
        .query('UPDATE PlantSeedInventory SET quantity = @newQuantity WHERE plant_id = @plantId');

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
    return plantIdList.length;
}

//need to rethink on how to write the functions......write them based on sql queries... or....
//there is no harvest plant info. i.e. no logic to harvest plant.


module.exports = {
    getAllPlantHarvestData,
    updatePlantHarvestData,
    getAllPlantInfo,
    insertNewPlant,
    getAllPlantSeedInventory,
    growPlant,
    harvestPlant,
    updatePlantSeedInventory,
    verifyPlantExists,
}
