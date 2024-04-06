const{ DEBUG } = require("../../../env.js");
const { dbConnection } = require("./mysql.js");

//insertNewEnergyConsumingDeviceObject
async function insertNewEnergyConsumingDevice(
  deviceName,
  quantity,
  energyConsumption
) {
  try {
    await dbConnection.execute(
      "INSERT INTO EnergyConsumingDevice (DeviceName, Quantity, EnergyConsumption) VALUES ( ?, ?, ?)",
      [deviceName, quantity, energyConsumption]
    );
    return 1;
  } catch (error) {
    console.error(
      "Error inserting new energy consuming device:",
      error.message
    );
    throw error;
  }
}

//verifyEnergyConsumingDeviceExist
async function verifyEnergyConsumingDeviceIdExist(deviceId) {
  try {
    const EnergyConsumingDeviceIdList = await dbConnection
      .promise()
      .query(
        "SELECT * FROM EnergyConsumingDevice WHERE DeviceId = ?",
        deviceId
      );
    // if (DEBUG) console.log(EnergyConsumingDeviceIdList);
    return EnergyConsumingDeviceIdList[0].length;
  } catch (error) {
    console.error(
      "Error verifying energy consuming device existence:",
      error.message
    );
    throw error;
  }
}

//updateEnergyConsumingDeviceQuantity TODO!!!paused here.
async function updateEnergyConsumingDevice(
  deviceId,
  newEnergyDeviceName,
  newQuantity,
  newEnergyConsumption
) {
  try {
    await dbConnection.execute(
      "UPDATE EnergyConsumingDevice SET DeviceName = ?, Quantity = ?, EnergyConsumption = ? WHERE DeviceId = ?;",
      [newEnergyDeviceName, newQuantity, newEnergyConsumption, deviceId]
    );
    return 1;
  } catch (error) {
    console.error("Error updating energy consuming device:", error.message);
    throw error;
  }
}

//deleteEnergyConsumingDeviceObject
async function deleteEnergyConsumingDevice(deviceId) {
  try {
    await dbConnection.execute(
      "DELETE FROM EnergyConsumingDevice WHERE DeviceId = ?",
      [deviceId]
    );
    return 1;
  } catch (error) {
    console.error("Error deleting energy consuming device:", error.message);
    throw error;
  }
}

//getAllEnergyConsumingDeviceData
async function getAllEnergyConsumingDevice() {
  try {
    const result = await dbConnection
      .promise()
      .query("SELECT * FROM EnergyConsumingDevice");
    return result[0][0];
  } catch (error) {
    if (DEBUG) console.log("Error fetching all energy consumption device:", error);
    throw error;
  }
}

async function getTotalEnergyConsumptionValue() {
  try {
    const result = await dbConnection.promise()
      .query(`SELECT SUM(COALESCE(Quantity, 0) * COALESCE(EnergyConsumption, 0)) AS EnergyUsage
    FROM EnergyConsumingDevice;
    `);
    if (DEBUG) console.log("getTotalEnergyConsumptionValue", result);
    if (DEBUG) console.log("getTotalEnergyConsumptionValue", result[0]);
    if (DEBUG) console.log("getTotalEnergyConsumptionValue", result[0][0]);
    return result[0][0];
  } catch (error) {
    console.error(
      "Error fetching all energy consuming devices:",
      error.message
    );
    throw error;
  }
}

module.exports = {
  insertNewEnergyConsumingDevice,
  verifyEnergyConsumingDeviceIdExist,
  updateEnergyConsumingDevice,
  deleteEnergyConsumingDevice,
  getAllEnergyConsumingDevice,
  getTotalEnergyConsumptionValue,
};
