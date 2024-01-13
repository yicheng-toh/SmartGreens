/*
\This file contains all the necessary plant related logic for plants route
this is designed specifically for MYSQL database.
*/
const {dbConnection} = require("../mysql.js");
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
    //check if the new plant exists... if yes thrown an negative flag.
    const plantIdList = await dbConnection.promise().query('SELECT id FROM PlantInfo WHERE PlantName = ?', plantName);
    if(plantIdList.length != 0){
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

async function growPlant(plantName, plantLocation, microcontrollerId, quantityDecrement){
    //may need to write this function using other functions.....and throw the error respectively...
    const plantIdList = await dbConnection.promise().query('SELECT id FROM PlantInfo WHERE PlantName = ?', plantName);
    if(plantIdList.length != 1){
        return 0;
    }
    const plantId = plantIdList[0];
    //(only to be done after checking.)need to insert the plant location to the plantbatch!!! need to create the plantbatch database.
    //decrement the number of seeds of in the plantseed inventory.
    const originalQuantity = await dbConnection.promise().query('SELECT quantity FROM PlantSeedInventory WHERE PlantId = ?', plantId);
    if(originalQuantity < quantityDecrement){
        return 0;//suppose to throw another error here....
    }
    const updatedQuantity= originalQuantity - quantityDecrement;
    await dbConnection.execute('UPDATE PlantSeedInventory SET quantity = ? WHERE plant_id = ?;', [updatedQuantity, plantId]);
    return 1;
}

async function updatePlantHarvestData(plantName, quantityChange){
    const plantIdList = await dbConnection.promise().query('SELECT id FROM PlantInfo WHERE PlantName = ?', plantName);
    if(plantIdList.length == 0){
        return 0;
    }
    const plantId = plantIdList[0];
    const currentQuantity = await dbConnection.promise().query('SELECT quantity FROM PlantHarvest WHERE PlantId = ?', plantId);
    const newQuantity = currentQuantity + quantityChange;
    await dbConnection.execute('UPDATE plantHarvest SET quantity = ? WHERE plant_id = ?;', [newQuantity, plantId]);
    return 1;

}

async function updatePlantSeedInventory(plantName, quantityChange){
    const plantIdList = await dbConnection.promise().query('SELECT id FROM PlantInfo WHERE PlantName = ?', plantName);
    if(plantIdList.length == 0){
        return 0;
    }
    const plantId = plantIdList[0];
    const currentQuantity = await dbConnection.promise().query('SELECT quantity FROM PlantSeedInventory WHERE PlantId = ?', plantId);
    const newQuantity = currentQuantity + quantityChange;
    await dbConnection.execute('UPDATE PlantSeedInventory SET quantity = ? WHERE plant_id = ?;', [newQuantity, plantId]);
    return 1;
}

//need to rethink on how to write the functions......write them based on sql queries... or....
//there is no harvest plant info. i.e. no logic to harvest plant.


module.exports = {
    getAllPlantHarvestData,
    updatePlantHarvestData,
    getAllPlantInfo,
    insertNewPlant,
    getAllPlantSeedInventory,
    updatePlantSeedInventory,
}
