const { dbConnection } = require("./mysql.js");

//insertNewEnergyConsumingDeviceObject
async function insertNewEnergyConsumingDevice(
  deviceName,
  quantity,
  energyConsumption
) {
  await dbConnection.execute(
    "INSERT INTO EnergyConsumingDevice (DeviceName, Quantity, EnergyConsumption) VALUES ( ?, ?, ?)",
    [deviceName, quantity, energyConsumption]
  );
  return 1;
}

//verifyEnergyConsumingDeviceExist
async function verifyEnergyConsumingDeviceIdExist(deviceId) {
  const EnergyConsumingDeviceIdList = await dbConnection
    .promise()
    .query("SELECT * FROM EnergyConsumingDevice WHERE DeviceId = ?", deviceId);
  // console.log(EnergyConsumingDeviceIdList);
  return EnergyConsumingDeviceIdList[0].length;
}

//updateEnergyConsumingDeviceQuantity TODO!!!paused here.
async function updateEnergyConsumingDevice(
  deviceId,
  newEnergyDeviceName,
  newQuantity,
  newEnergyConsumption
) {
  await dbConnection.execute(
    "UPDATE EnergyConsumingDevice SET DeviceName = ?, Quantity = ?, EnergyConsumption = ? WHERE DeviceId = ?;",
    [newEnergyDeviceName, newQuantity, newEnergyConsumption, deviceId]
  );
  return 1;
}

//deleteEnergyConsumingDeviceObject
async function deleteEnergyConsumingDevice(deviceId) {
  await dbConnection.execute("DELETE FROM EnergyConsumingDevice WHERE DeviceId = ?", [
    deviceId,
  ]);
  return 1;
}

//getAllEnergyConsumingDeviceData
async function getAllEnergyConsumingDevice() {
  const result = await dbConnection.promise().query("SELECT * FROM EnergyConsumingDevice");
  return result[0][0];
}

async function getTotalEnergyConsumptionValue(){
    const result = await dbConnection.promise().query(`SELECT SUM(COALESCE(Quantity, 0) * COALESCE(EnergyConsumption, 0)) AS EnergyUsage
    FROM EnergyConsumingDevice;
    `);
    console.log("getTotalEnergyConsumptionValue",result);
    console.log("getTotalEnergyConsumptionValue",result[0]);
    console.log("getTotalEnergyConsumptionValue",result[0][0]);
    return result[0][0];
}

module.exports = {
  insertNewEnergyConsumingDevice,
  verifyEnergyConsumingDeviceIdExist,
  updateEnergyConsumingDevice,
  deleteEnergyConsumingDevice,
  getAllEnergyConsumingDevice,
  getTotalEnergyConsumptionValue
};
