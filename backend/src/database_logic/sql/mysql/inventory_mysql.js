

//inventory table
const {dbConnection} = require("../mysql.js");
//insertNewInventoryObject
async function insertNewInventoryObject(itemName, quantity, units){
    if(quantity == NULL){
        quantity = 0;
    }
    await dbConnection.execute('INSERT INTO Inventory (InventoryName,Quantity,Units) VALUES (?, ?, ?)',
        [itemName, quantity, units]);
    return 1;
}


//updateInventoryQuantity TODO!!!paused here.
async function updateInventoryQuantity(itemName, quantityChange){
    //check if the itemName exists.
    //update the quantity
    const inventoryIdList = await dbConnection.execute('SELECT id FROM Inventory WHERE InventoryName = ?', itemName);
    if(inventoryIdList.length == 0){
        return 0;
    }
    const inventoryId = invetoryIdList[0];
    const currentQuantity = await dbConnection.execute('SELECT quantity FROM Inventory WHERE InventoryID = ?', inventoryId);
    const newQuantity = currentQuantity + quantityChange;
    await dbConnection.execute('UPDATE Inventory SET quantity = ? WHERE InventoryID = ?;', [newQuantity, inventoryId]);
    return 1;
}
//updateInventoryUnits
async function updateInventoryUnit(itemName, newUnit){
    //check if the itemName exists.
    //update the quantity
    const inventoryIdList = await dbConnection.execute('SELECT id FROM Inventory WHERE InventoryName = ?', itemName);
    if(inventoryIdList.length == 0){
        return 0;
    }
    const inventoryId = inventoryIdList[0];
    await dbConnection.execute('UPDATE Inventory SET Units = ? WHERE InventoryID = ?;', [newUnit, inventoryId]);
    return 1;
}
//deleteInventoryObject
async function deleteInventoryObject(itemName){
    await dbConnection.execute('DELETE FROM Inventory WHERE itemName = ?', [itemName]);
}