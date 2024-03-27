const {createDbConnection} = require("./mssql.js");
const sql = require("mssql");

// insertNewEnergyConsumingDevice
async function insertNewEnergyConsumingDevice(deviceName, quantity, energyConsumption) {
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
  try {
    await request
    .input('deviceName', sql.VarChar, deviceName)
    .input('quantity', sql.Int, quantity)
    .input('energyConsumption', sql.Float, energyConsumption)
    .query('INSERT INTO EnergyConsumingDevice (DeviceName, Quantity, EnergyConsumption) VALUES (@deviceName, @quantity, @energyConsumption)');
    await dbConnection.disconnect();
    return 1; // Return success
  } catch (error) {
    console.error("Error inserting new energy consuming device:", error.message);
    await dbConnection.disconnect();
    throw error;
  }
}

// verifyEnergyConsumingDeviceExist
async function verifyEnergyConsumingDeviceIdExist(deviceId) {
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
  try {
    const result = await request
    .input('deviceId', sql.Int, deviceId)
    .query("SELECT * FROM EnergyConsumingDevice WHERE DeviceId = @deviceId");
    await dbConnection.disconnect();
    return result.recordset.length;
  } catch (error) {
    await dbConnection.disconnect();
    console.error("Error verifying energy consuming device existence:", error.message);
    throw error;
  }
}

// updateEnergyConsumingDevice
async function updateEnergyConsumingDevice(deviceId, newEnergyDeviceName, newQuantity, newEnergyConsumption) {
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
  try {
    await request
    .input('newEnergyDeviceName', sql.VarChar, newEnergyDeviceName)
    .input('newQuantity', sql.Int, newQuantity)
    .input('newEnergyConsumption', sql.Float, newEnergyConsumption)
    .input('deviceId', sql.Int, deviceId)
    .query(
      "UPDATE EnergyConsumingDevice SET DeviceName = @newEnergyDeviceName, Quantity = @newQuantity, EnergyConsumption = @newEnergyConsumption WHERE DeviceId = @deviceId"
    );
    await dbConnection.disconnect();
    return 1; // Return success
  } catch (error) {
    await dbConnection.disconnect();
    console.error("Error updating energy consuming device:", error.message);
    throw error;
  }
}

// deleteEnergyConsumingDevice
async function deleteEnergyConsumingDevice(deviceId) {
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
  try {
    await request
    .input('deviceId', sql.Int, deviceId)
    .query("DELETE FROM EnergyConsumingDevice WHERE DeviceId = @deviceId");
    await dbConnection.disconnect();
    return 1; // Return success
  } catch (error) {
    await dbConnection.disconnect();
    console.error("Error deleting energy consuming device:", error.message);
    throw error;
  }
}

// getAllEnergyConsumingDeviceData
async function getAllEnergyConsumingDevice() {
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
  try {
    const result = await request.query("SELECT * FROM EnergyConsumingDevice");
    await dbConnection.disconnect();
    return result.recordset;
  } catch (error) {
    await dbConnection.disconnect();
    console.error("Error fetching all energy consuming devices:", error.message);
    throw error;
  }
}

// getTotalEnergyConsumptionValue
async function getTotalEnergyConsumptionValue() {
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
  try {
    const result = await request.query(`SELECT SUM(COALESCE(Quantity, 0) * COALESCE(EnergyConsumption, 0)) AS EnergyUsage FROM EnergyConsumingDevice`);
    await dbConnection.disconnect();
    return result.recordset[0];
  } catch (error) {
    await dbConnection.disconnect();
    console.error("Error fetching total energy consumption value:", error.message);
    throw error;
  }
}

module.exports = {
  insertNewEnergyConsumingDevice,
  verifyEnergyConsumingDeviceIdExist,
  updateEnergyConsumingDevice,
  deleteEnergyConsumingDevice,
  getAllEnergyConsumingDevice,
  getTotalEnergyConsumptionValue
};
