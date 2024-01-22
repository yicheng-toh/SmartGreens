

// const { query } = require("mssql");
const {createDbConnection} = require("../mssql.js");
const sql = require("mssql");

//insertNewInventoryObject
async function insertNewInventoryObject(itemName, quantity, units, location){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    request.input('itemName', sql.VarChar, itemName)
        .input('quantity', sql.Int, quantity)
        .input('units', sql.VarChar, units)
        .input('location', sql.Int, location)
        .query('INSERT INTO Inventory (InventoryName, Quantity, Units, Location) VALUES (@itemName, @quantity, @units, @location)');
    dbConnection.disconnect();
    return 1;
}

//verifyInventoryIdExist
async function verifyInventoryIdExist(inventoryId){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const inventoryIdList = await request
        .input('inventoryId', sql.Int, inventoryId)
        .query('SELECT id FROM Inventory WHERE InventoryId = @inventoryId');
    dbConnection.disconnect();
    return inventoryIdList.recordset.length;
}

//updateInventoryQuantity TODO!!!paused here.
async function updateInventoryQuantity(inventoryId, quantityChange){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    // const currentQuantity = await request.query('SELECT quantity FROM Inventory WHERE InventoryID = ?', inventoryId);
    const currentQuantity = await request
        .input('inventoryId', sql.Int, inventoryId)
        .query('SELECT quantity FROM Inventory WHERE InventoryID = @inventoryId').recordset[0];
    const newQuantity = currentQuantity + quantityChange;
    // await dbConnection.execute('UPDATE Inventory SET quantity = ? WHERE InventoryID = ?;', [newQuantity, inventoryId]);
    await request
        .input('newQuantity', sql.Int, newQuantity)
        .input('inventoryId', sql.Int, inventoryId)
        .query('UPDATE Inventory SET quantity = @newQuantity WHERE InventoryId = @inventoryId');
    dbConnection.disconnect();
    return 1;
}
//updateInventoryUnits
async function updateInventoryUnit(inventoryId, newUnit){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    // await dbConnection.execute('UPDATE Inventory SET Units = ? WHERE InventoryID = ?;', [newUnit, inventoryId]);
    await request
        .input('newUnit', sql.VarChar, newUnit)
        .input('inventoryId', sql.Int, inventoryId)
        .query('UPDATE Inventory SET Units = @newUnit WHERE InventoryID = @inventoryId');
    dbConnection.disconnect();
    return 1;
}
//deleteInventoryObject
async function deleteInventoryObject(inventoryId){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    // await dbConnection.execute('DELETE FROM Inventory WHERE InventoryID = ?', [inventoryId]);
    await request
    .input('inventoryId', sql.Int, inventoryId)
    .query('DELETE FROM Inventory WHERE InventoryID = @inventoryId');
    dbConnection.disconnect();
}

//getAllInventoryData
async function getAllInventoryData(){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    const queryResult =  await request.query('SELECT * FROM Inventory');
    dbConnection.disconnect();
    return queryResult.recordset;
}

module.exports ={
    insertNewInventoryObject,
    verifyInventoryIdExist,
    updateInventoryQuantity,
    updateInventoryUnit,
    deleteInventoryObject,
    getAllInventoryData,
}