

const {dbConnection} = require("../mysql.js");

//insertNewInventoryObject
async function insertNewInventoryObject(itemName, quantity, units, location){
    await dbConnection.execute('INSERT INTO Inventory (InventoryName,Quantity,Units,Location) VALUES (?, ?, ?)',
        [itemName, quantity, units, location]);
    return 1;
}

//verifyInventoryIdExist
async function verifyInventoryIdExist(inventoryId){
    const inventoryIdList = await dbConnection.promise().query('SELECT id FROM Inventory WHERE InventoryId = ?', inventoryId);
    return inventoryIdList[0].length;
}

//updateInventoryQuantity TODO!!!paused here.
async function updateInventoryQuantity(inventoryId, quantityChange){
    const currentQuantity = await dbConnection.promise().query('SELECT quantity FROM Inventory WHERE InventoryID = ?', inventoryId);
    const newQuantity = currentQuantity + quantityChange;
    await dbConnection.execute('UPDATE Inventory SET quantity = ? WHERE InventoryId = ?;', [newQuantity, inventoryId]);
    return 1;
}
//updateInventoryUnits
async function updateInventoryUnit(inventoryId, newUnit){
    await dbConnection.execute('UPDATE Inventory SET Units = ? WHERE InventoryId = ?;', [newUnit, inventoryId]);
    return 1;
}
//deleteInventoryObject
async function deleteInventoryObject(inventoryId){
    await dbConnection.execute('DELETE FROM Inventory WHERE InventoryId = ?', [inventoryId]);
}

//getAllInventoryData
async function getAllInventoryData(){
    return await dbConnection.promise().query('SELECT * FROM Inventory')[0];
}

module.exports ={
    insertNewInventoryObject,
    verifyInventoryIdExist,
    updateInventoryQuantity,
    updateInventoryUnit,
    deleteInventoryObject,
    getAllInventoryData,
}