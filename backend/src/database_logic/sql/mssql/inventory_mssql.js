

const { query } = require("mssql");
const {dbConnection} = require("../mssql.js");

//insertNewInventoryObject
async function insertNewInventoryObject(itemName, quantity, units){
    const request = await dbConnection.connect();
    request.input('itemName', dbConnection.VarChar, itemName)
        .input('quantity', dbConnection.Int, quantity)
        .input('units', dbConnection.VarChar, units)
        .query('INSERT INTO Inventory (InventoryName, Quantity, Units) VALUES (@itemName, @quantity, @units)');
    dbConnection.disconnect();
    return 1;
}

//verifyInventoryIdExist
async function verifyInventoryIdExist(inventoryId){
    const request = await dbConnection.connect();
    const inventoryIdList = await request
        .input('inventoryId', dbConnection.Int, inventoryId)
        .query('SELECT id FROM Inventory WHERE InventoryID = @inventoryId');
    dbConnection.disconnect();
    return inventoryIdList.length;
}

//updateInventoryQuantity TODO!!!paused here.
async function updateInventoryQuantity(inventoryId, quantityChange){
    const request = await dbConnection.connect();
    // const currentQuantity = await request.query('SELECT quantity FROM Inventory WHERE InventoryID = ?', inventoryId);
    const currentQuantity = await request
        .input('inventoryId', dbConnection.Int, inventoryId)
        .query('SELECT quantity FROM Inventory WHERE InventoryID = @inventoryId');
    const newQuantity = currentQuantity + quantityChange;
    // await dbConnection.execute('UPDATE Inventory SET quantity = ? WHERE InventoryID = ?;', [newQuantity, inventoryId]);
    await request
        .input('newQuantity', dbConnection.Int, newQuantity)
        .input('inventoryId', dbConnection.Int, inventoryId)
        .query('UPDATE Inventory SET quantity = @newQuantity WHERE InventoryID = @inventoryId');
    dbConnection.disconnect();
    return 1;
}
//updateInventoryUnits
async function updateInventoryUnit(inventoryId, newUnit){
    const request = await dbConnection.connect();
    // await dbConnection.execute('UPDATE Inventory SET Units = ? WHERE InventoryID = ?;', [newUnit, inventoryId]);
    await request
        .input('newUnit', dbConnection.VarChar, newUnit)
        .input('inventoryId', dbConnection.Int, inventoryId)
        .query('UPDATE Inventory SET Units = @newUnit WHERE InventoryID = @inventoryId');
    dbConnection.disconnect();
    dbConnection.disconnect();
    return 1;
}
//deleteInventoryObject
async function deleteInventoryObject(inventoryId){
    const request = await dbConnection.connect();
    // await dbConnection.execute('DELETE FROM Inventory WHERE InventoryID = ?', [inventoryId]);
    await request
    .input('inventoryId', dbConnection.Int, inventoryId)
    .query('DELETE FROM Inventory WHERE InventoryID = @inventoryId');
    dbConnection.disconnect();
}

//getAllInventoryData
async function getAllInventoryData(){
    const request = await dbConnection.connect();
    const queryResult =  await request.query('SELECT * FROM Inventory');
    dbConnection.disconnect();
    return queryResult;
}

module.exports ={
    insertNewInventoryObject,
    verifyInventoryIdExist,
    updateInventoryQuantity,
    updateInventoryUnit,
    deleteInventoryObject,
    getAllInventoryData,
}