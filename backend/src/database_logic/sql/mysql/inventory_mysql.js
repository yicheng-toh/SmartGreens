

const {dbConnection} = require("./mysql.js");

//insertNewInventoryObject
async function insertNewInventoryObject(itemName, quantity, units, location){
    await dbConnection.execute('INSERT INTO Inventory (InventoryName,Quantity,Units,Location) VALUES (?, ?, ?, ?)',
        [itemName, quantity, units, location]);
    return 1;
}

//verifyInventoryIdExist
async function verifyInventoryIdExist(inventoryId){
    const inventoryIdList = await dbConnection.promise().query('SELECT * FROM Inventory WHERE InventoryId = ?', inventoryId);
    // console.log(inventoryIdList);
    return inventoryIdList[0].length;
}

//updateInventoryQuantity TODO!!!paused here.
async function updateInventoryQuantity(inventoryId, quantityChange){
    const currentQuantityQueryResult = await dbConnection.promise().query('SELECT * FROM Inventory WHERE InventoryID = ?', inventoryId);
    // console.log(currentQuantityQueryResult);
    const currentQuantity = currentQuantityQueryResult[0][0].Quantity;
    const newQuantity = currentQuantity + quantityChange;
    if (newQuantity<0){
        throw new Error(`There are insufficient ${currentQuantityQueryResult[0][0].InventoryName}`);
        return;
    }
    // console.log(currentQuantity);
    // console.log("new quatity", newQuantity);
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
    return 1;
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