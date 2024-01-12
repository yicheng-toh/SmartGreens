/*
\This file contains all the necessary plant related logic for plants route
this is designed specifically for MYSQL database.
*/
const {dbConnection} = require("../mysql.js");
//Functions will be divided into different tables

// plantharvest

//getAllPlantHarvestData
async function getAllPlantHarvestData(){
    queryResult = await dbConnection.promise().query('SELECT * FROM PlantHarvest');
    return queryResult;
}

//updatePlantHarvestData
async function updatePlantHarvestData(plantName, quantityChange){
    const plantId = await dbConnection.execute('SELECT id FROM PlantInfo WHERE PlantName = ?', plantName);
    if(plantId.length == 0){
        return 0;
    }
    const currentQuantity = await dbConnection.execute('SELECT quantity FROM PlantHarvest WHERE PlantId = ?', plantId[0]);
    const newQuantity = currentQuantity + quantityChange;
    await dbConnection.execute('UPDATE plantHarvest SET quantity = ? WHERE plant_id = ?;', [newQuantity, plantId]);
    return 1;

}

// plantinfo

//getAllPlantInfo
async function getAllPlantInfo(){
    queryResult = await dbConnection.promise().query('SELECT * FROM PlantInfo');
    return queryResult;
}
//insertNewPlant
//-not just inserting, but also initialising the tables for plant seed inventory and plant 
async function insertNewPlant(plantName,SensorsRanges,DaysToMature){
    //check if the new plant exists... if yes thrown an negative flag.
    const plantId = await dbConnection.execute('SELECT id FROM PlantInfo WHERE PlantName = ?', plantName);
    if(plantId.length != 0){
        return 0;
    }
    //insert new data into the database.
    const [result, fields] = await dbConnection.execute('INSERT INTO PlantInfo (PlantName,SensorsRanges,DaysToMature) VALUES (?, ?, ?)',
        [plantName,SensorsRanges,DaysToMature]);
    const newPlantId = result.insertId;
    await dbConnection.execute('INSERT INTO PlantHarvest (PlantID, Quantity) VALUES (?,?)',
        [newPlantId, 0]);
    await dbConnection.execute('INSERT INTO PlantSeedInventory (PlantID, Quantity) VALUES (?,?)',
        [newPlantId, 0]);
    return 1;
}

// plantseedinventory

//getAllPlantSeedInvetory
async function getAllPlantSeedInventory(){
    queryResult = await dbConnection.promise().query('SELECT * FROM PlantSeedInventory');
    return queryResult;
}
//updatePlantSeedInventory
async function updatePlantSeedInventory(plantName, quantityChange){
    const plantIdList = await dbConnection.execute('SELECT id FROM PlantInfo WHERE PlantName = ?', plantName);
    if(plantIdList.length == 0){
        return 0;
    }
    const plantId = plantIdList[0];
    const currentQuantity = await dbConnection.execute('SELECT quantity FROM PlantSeedInventory WHERE PlantId = ?', plantId);
    const newQuantity = currentQuantity + quantityChange;
    await dbConnection.execute('UPDATE PlantSeedInventory SET quantity = ? WHERE plant_id = ?;', [newQuantity, plantId]);
    return 1;
}

module.exports = {
    getAllPlantHarvestData,
    updatePlantHarvestData,
    getAllPlantInfo,
    insertNewPlant,
    getAllPlantSeedInventory,
    updatePlantSeedInventory,
}
