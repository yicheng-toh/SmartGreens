

const {dbConnection} = require("../mysql.js");

//insertNewInventoryObject
async function insertNewInventoryObject(itemName, quantity, units){
    await dbConnection.execute('INSERT INTO Inventory (InventoryName,Quantity,Units) VALUES (?, ?, ?)',
        [itemName, quantity, units]);
    return 1;
}

//verifyInventoryIdExist
async function verifyInventoryIdExist(inventoryId){
    const inventoryIdList = await dbConnection.promise().query('SELECT id FROM Inventory WHERE InventoryName = ?', itemName);
    return inventoryIdList.length;
}

//updateInventoryQuantity TODO!!!paused here.
async function updateInventoryQuantity(inventoryId, quantityChange){
    const currentQuantity = await dbConnection.promise().query('SELECT quantity FROM Inventory WHERE InventoryID = ?', inventoryId);
    const newQuantity = currentQuantity + quantityChange;
    await dbConnection.execute('UPDATE Inventory SET quantity = ? WHERE InventoryID = ?;', [newQuantity, inventoryId]);
    return 1;
}
//updateInventoryUnits
async function updateInventoryUnit(inventoryId, newUnit){
    await dbConnection.execute('UPDATE Inventory SET Units = ? WHERE InventoryID = ?;', [newUnit, inventoryId]);
    return 1;
}
//deleteInventoryObject
async function deleteInventoryObject(inventoryId){
    await dbConnection.execute('DELETE FROM Inventory WHERE InventoryID = ?', [inventoryId]);
}

//getAllInventoryData
async function getAllInventoryData(){
    return await dbConnection.promise().query('SELECT * FROM Inventory');
}

module.exports ={
    insertNewInventoryObject,
    verifyInventoryIdExist,
    updateInventoryQuantity,
    updateInventoryUnit,
    deleteInventoryObject,
    getAllInventoryData,
}