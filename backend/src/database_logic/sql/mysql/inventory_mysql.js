const{ DEBUG } = require("../../../env.js");
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
    // if (DEBUG) console.log(inventoryIdList);
    return inventoryIdList[0].length;
}

//updateInventoryQuantity TODO!!!paused here.
async function updateInventoryQuantity(inventoryId, quantityChange){
    const currentQuantityQueryResult = await dbConnection.promise().query('SELECT * FROM Inventory WHERE InventoryID = ?', inventoryId);
    // if (DEBUG) console.log(currentQuantityQueryResult);
    const currentQuantity = currentQuantityQueryResult[0][0].Quantity;
    const newQuantity = currentQuantity + quantityChange;
    if (newQuantity<0){
        throw new Error(`There are insufficient ${currentQuantityQueryResult[0][0].InventoryName}`);
        return;
    }
    // if (DEBUG) console.log(currentQuantity);
    // if (DEBUG) console.log("new quatity", newQuantity);
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

async function insertNewInventoryObject2(id, itemName, quantity, units=null, location){
    await dbConnection.execute('INSERT INTO Inventory2 (id, item, quantity, units, location) VALUES (?, ?, ?, ?, ?)',
        [id, itemName, quantity, units, location]);
    return 1;
}

//verifyInventoryIdExist
async function verifyInventoryIdExist2(inventoryId){
    const inventoryIdList = await dbConnection.promise().query('SELECT * FROM Inventory2 WHERE id = ?', inventoryId);
    // if (DEBUG) console.log(inventoryIdList);
    return inventoryIdList[0].length;
}

//updateInventoryQuantity TODO!!!paused here.
async function updateInventoryQuantity2(inventoryId, quantityChange){
    const currentQuantityQueryResult = await dbConnection.promise().query('SELECT * FROM Inventory2 WHERE id = ?', inventoryId);
    // if (DEBUG) console.log(currentQuantityQueryResult);
    const currentQuantity = currentQuantityQueryResult[0][0].quantity;
    const newQuantity = currentQuantity + quantityChange;
    if (newQuantity<0){
        throw new Error(`There are insufficient ${currentQuantityQueryResult[0][0].item}`);
        return;
    }
    // if (DEBUG) console.log(currentQuantity);
    // if (DEBUG) console.log("new quatity", newQuantity);
    await dbConnection.execute('UPDATE Inventory2 SET quantity = ? WHERE item = ?;', [newQuantity, inventoryId]);
    return 1;
}
//updateInventoryUnits
async function updateInventoryUnit2(inventoryId, newUnit){
    await dbConnection.execute('UPDATE Inventory2 SET units = ? WHERE id = ?;', [newUnit, inventoryId]);
    return 1;
}
//deleteInventoryObject
async function deleteInventoryObject2(inventoryId){
    await dbConnection.execute('DELETE FROM Inventory2 WHERE id = ?', [inventoryId]);
    return 1;
}

//getAllInventoryData
async function getAllInventoryData2(){
    let result = await dbConnection.promise().query('SELECT * FROM Inventory2');
    if (DEBUG) console.log(result);
    if (DEBUG) console.log(result[0]);
    return result[0];
}

module.exports ={
    insertNewInventoryObject: insertNewInventoryObject2,
    verifyInventoryIdExist: verifyInventoryIdExist2,
    updateInventoryQuantity: updateInventoryQuantity2,
    updateInventoryUnit: updateInventoryQuantity2,
    deleteInventoryObject: deleteInventoryObject2,
    getAllInventoryData: getAllInventoryData2,
}