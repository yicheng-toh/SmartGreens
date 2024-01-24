/*
\This file contains all the necessary plant related logic for plants route
this is designed specifically for MYSQL database.
*/
const {dbConnection} = require("./mysql.js");
//Functions will be divided into different tables


async function getAllPlantHarvestData(){
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
    queryResult = await dbConnection.promise().query(query);
    return queryResult[0];
}

async function getAllPlantInfo(){
    queryResult = await dbConnection.promise().query('SELECT * FROM PlantInfo');
    return queryResult[0];
}

async function getAllPlantSeedInventory(){
    queryResult = await dbConnection.promise().query('SELECT CurrentSeedInventory FROM PlantInfo');
    return queryResult[0];
}

async function insertNewPlant(plantName,SensorsRanges,DaysToMature){
    const result = await dbConnection.execute('INSERT INTO PlantInfo (PlantName,SensorsRanges,DaysToMature) VALUES (?, ?, ?)',
        [plantName,SensorsRanges,DaysToMature]);
    return 1;
}

//This function may need to be broken up in the routes for error catching.
async function harvestPlant(plantBatchId, quantityHarvested){
    //check if quantity harvested is greater than the quantity planted.
const quantityPlantedResultList = await dbConnection.promise().query('SELECT QuantityPlanted FROM PlantBatch WHERE PlantBatchId = ?', plantBatchId);
    const quantityPlanted = quantityPlantedResultList[0][0].QuantityPlanted;
    if(quantityHarvested > quantityPlanted){
        return 0;
    }

    await dbConnection.execute('UPDATE PlantBatch SET quantityHarvested = ? WHERE plantBatchId = ?;', 
    [quantityHarvested, plantBatchId]);
    // const plantIdResultList = await dbConnection.prommise().query('SELECT plantId FROM PlantBatch WHERE PlantBatchId = ?', 
    //     [plantBatchId])[0];
    // const plantId = plantIdResultList[0].plantId;
    // await updatePlantHarvestData(plantId, quantityHarvested);
    await dbConnection.execute('UPDATE MicrocontrollerPlantBatchPair SET plantBatchId= NULL WHERE PlantBatchId = ?', 
        [plantBatchId])
    return 1;
}

//This function may need to be broken up in the routes for error catching.
async function growPlant(plantId, plantLocation, microcontrollerId, quantityDecrement, datePlanted){
    //update the seed inventory
    const result = await dbConnection.execute('INSERT INTO PlantBatch (plantID, plantLocation, quantityPlanted, datePlanted) VALUES (?,?,?,?)',
        [plantId, plantLocation, quantityDecrement, datePlanted]);
    // console.log(result);
    // console.log(result.insertId);
    const plantBatchId = result.insertId;
    const originalQuantityResultList = await dbConnection.promise().query('SELECT CurrentSeedInventory FROM PlantInfo WHERE PlantId = ?', plantId);
    // console.log(originalQuantityResultList);
    // console.log(originalQuantityResultList[0]);
    // console.log(!originalQuantityResultList[0]);
    // console.log(!originalQuantityResultList[0].length);
    // console.log(originalQuantityResultList[0][0]);
    if(!originalQuantityResultList[0].length){
        return 0;
    }
    const originalQuantity = originalQuantityResultList[0][0].CurrentSeedInventory;
    // console.log("original quantity", originalQuantity);
    // console.log("quanttiey decreemtn", quantityDecrement);
    if(quantityDecrement > originalQuantity){
        return 0;
    }
    const updatedQuantity= originalQuantity - quantityDecrement;
    await dbConnection.execute('UPDATE PlantInfo SET CurrentSeedInventory = ? WHERE plantId = ?;', [updatedQuantity, plantId]);
    //update the microcontoller batch table.
    await dbConnection.execute('INSERT INTO MicrocontrollerPlantbatchPair (microcontrollerId, plantBatchId) VALUES (?, ?) ON DUPLICATE KEY UPDATE microcontrollerId = VALUES(microcontrollerId), plantBatchId = VALUES(plantBatchId)',
        [microcontrollerId, plantBatchId]);
    return 1;
}

// async function updatePlantHarvestData(plantId, quantityChange){
//     const currentQuantity = await dbConnection.promise().query('SELECT quantity FROM PlantHarvest WHERE PlantId = ?', plantId);
//     const newQuantity = currentQuantity[0].quantity + quantityChange;
//     await dbConnection.execute('UPDATE plantHarvest SET quantity = ? WHERE plant_id = ?;', [newQuantity, plantId]);
//     //remove from the microcontroller batch table.
//     return 1;

// }

async function updatePlantSeedInventory(plantId, quantityChange){
    const currentQuantity = await dbConnection.promise().query('SELECT CurrentSeedInventory FROM PlantInfo WHERE PlantId = ?', plantId);
    const newQuantity = currentQuantity[0][0].CurrentSeedInventory + quantityChange;
    await dbConnection.execute('UPDATE PlantInfo SET CurrentSeedInventory = ? WHERE plantId = ?;', [newQuantity, plantId]);
    return 1;
}

async function verifyPlantExists(plantId){
    const plantIdList = await dbConnection.promise().query('SELECT id FROM PlantInfo WHERE PlantId= ?', plantId);
    return plantIdList[0].length;
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
