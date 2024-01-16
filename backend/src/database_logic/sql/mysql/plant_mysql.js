/*
\This file contains all the necessary plant related logic for plants route
this is designed specifically for MYSQL database.
*/
const {dbConnection} = require("./mysql.js");
//Functions will be divided into different tables


async function getAllPlantHarvestData(){
    queryResult = await dbConnection.promise().query('SELECT * FROM PlantHarvest');
    return queryResult;
}

async function getAllPlantInfo(){
    queryResult = await dbConnection.promise().query('SELECT * FROM PlantInfo');
    return queryResult;
}

async function getAllPlantSeedInventory(){
    queryResult = await dbConnection.promise().query('SELECT * FROM PlantSeedInventory');
    return queryResult;
}

async function insertNewPlant(plantName,SensorsRanges,DaysToMature){
    const [result, fields] = await dbConnection.execute('INSERT INTO PlantInfo (PlantName,SensorsRanges,DaysToMature) VALUES (?, ?, ?)',
        [plantName,SensorsRanges,DaysToMature]);
    const newPlantId = result.insertId;
    await dbConnection.execute('INSERT INTO PlantHarvest (PlantID, Quantity) VALUES (?,?)',
        [newPlantId, 0]);
    await dbConnection.execute('INSERT INTO PlantSeedInventory (PlantID, Quantity) VALUES (?,?)',
        [newPlantId, 0]);
    return 1;
}

//This function may need to be broken up in the routes for error catching.
async function harvestPlant(plantBatch, quantityHarvested){
    await dbConnection.execute('UPDATE PlantBatch SET quantityHarvested = ? WHERE plantBatch = ?;', 
    [plantBatch, quantityHarvested]);
    const plantIdResultList = await dbConnection.prommise().query('SELECT plantId FROM PlantBatch WHERE plantBatch = ?', 
        []);
    const plantId = plantIdResultList[0].plantId;
    await updatePlantHarvestData(plantId, quantityHarvested);
    return 1;
}

//This function may need to be broken up in the routes for error catching.
async function growPlant(plantId, plantLocation, microcontrollerId, quantityDecrement){
    //update the seed inventory
    const [result] = await dbConnection.execute('INSERT INTO PlantBatch (plantID, plantLocation, quantityPlanted) VALUES (?,?,?)',
        [plantId, plantLocation, quantityDecrement]);
    const plantBatchId = result.insertId;
    const originalQuantityResultList = await dbConnection.promise().query('SELECT quantity FROM PlantSeedInventory WHERE PlantId = ?', plantId);
    const originalQuantity = originalQuantityResultList[0].quantity;
    const updatedQuantity= originalQuantity - quantityDecrement;
    await dbConnection.execute('UPDATE PlantSeedInventory SET quantity = ? WHERE plant_id = ?;', [updatedQuantity, plantId]);
    //update the microcontoller batch table.
    await dbConnection.execute('INSERT INTO MicrocontrollerPlantbatchPair (microcontrollerId, plantBatch) VALUES (?, ?) ON DUPLICATE KEY UPDATE microcontrollerId = VALUES(microcontrollerId),  column2 = VALUES(plantBatch)',
        [microcontrollerId,plantBatchId]);
    return 1;
}

async function updatePlantHarvestData(plantId, quantityChange){
    const currentQuantity = await dbConnection.promise().query('SELECT quantity FROM PlantHarvest WHERE PlantId = ?', plantId);
    const newQuantity = currentQuantity + quantityChange;
    await dbConnection.execute('UPDATE plantHarvest SET quantity = ? WHERE plant_id = ?;', [newQuantity, plantId]);
    //remove from the microcontroller batch table.
    return 1;

}

async function updatePlantSeedInventory(plantId, quantityChange){
    const currentQuantity = await dbConnection.promise().query('SELECT quantity FROM PlantSeedInventory WHERE PlantId = ?', plantId);
    const newQuantity = currentQuantity + quantityChange;
    await dbConnection.execute('UPDATE PlantSeedInventory SET quantity = ? WHERE plant_id = ?;', [newQuantity, plantId]);
    return 1;
}

async function verifyPlantExists(plantId){
    const plantIdList = await dbConnection.promise().query('SELECT id FROM PlantInfo WHERE PlantID= ?', plantId);
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
