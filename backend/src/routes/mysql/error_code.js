const DATABASE_OPERATION_ERROR = '9999';
const INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME = '2100';
const INSERT_NEW_INVENTORY_INVALID_QUANTITY = '2101';
const UPDATE_INVENTORY_QUANTITY_UNDEFINED_INVENTORY_ID = '2110'
const UPDATE_INVENTORY_QUANTITY_INVALID_INVENTORY_ID = '2111';//id not found in the database. need to insert the inventory first.
const UPDATE_INVENTORY_UNIT_UNDEFINED_INVENTORY_ID = '2110'
const UPDATE_INVENTORY_UNIT_INVALID_INVENTORY_ID = '2111';//id not found in the database. need to insert the inventory first.
const UPDATE_INVENTORY_QUANTITY_UNDEFINED_QUANTITY_CHANGE = '2112';
const UPDATE_INVENTORY_QUANTITY_INVALID_QUANTITY_CHANGE = '2113';
const DELETE_INVENTORY_UNDEFINED_INVENTORY_ID = '2300';
const DELETE_INVENTORY_INVALID_INVENTORY_ID = '2301';//id not found in the database. need to insert the inventory first.




module.exports ={
    DATABASE_OPERATION_ERROR,
    INSERT_NEW_INVENTORY_UNDEFINED_INVENTORY_NAME,
    INSERT_NEW_INVENTORY_INVALID_QUANTITY,
    UPDATE_INVENTORY_QUANTITY_UNDEFINED_INVENTORY_ID,
    UPDATE_INVENTORY_QUANTITY_INVALID_INVENTORY_ID,
    UPDATE_INVENTORY_QUANTITY_UNDEFINED_QUANTITY_CHANGE,
    UPDATE_INVENTORY_QUANTITY_INVALID_QUANTITY_CHANGE,
    UPDATE_INVENTORY_UNIT_UNDEFINED_INVENTORY_ID,
    UPDATE_INVENTORY_UNIT_INVALID_INVENTORY_ID,
    DELETE_INVENTORY_UNDEFINED_INVENTORY_ID,
    DELETE_INVENTORY_INVALID_INVENTORY_ID

};