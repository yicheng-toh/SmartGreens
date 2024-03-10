const {dbConnection} = require("./mysql.js");

// Function to create the BASESENSOR table if it doesn't exist
// async function createTableIfNotExistsScrapped() {
//     try {
     
//       // Create the Sensor Detail table
//       const createSensorDetailTable = `
//           CREATE TABLE IF NOT EXISTS SensorDetail (
//           dateTime DATETIME,
//           microcontrollerId INT,
//           plantBatch INT,
//           temperature FLOAT,
//           humidity INT,
//           brightness INT
//           )
//           `;
      
//       // Create Microcontroller Plant Pair Table
//       const createMicrocontrollerPlantPairTable = `
//           CREATE TABLE IF NOT EXISTS MicrocontrollerPlantbatchPair (
//           microcontrollerId INT,
//           plantBatch INT,
//           )
//           `;
  
//       // Create the Plant Batch table
//       const createPlantBatchTable = `
//           CREATE TABLE IF NOT EXISTS PlantDetail (
//           id INT AUTO_INCREMENT PRIMARY KEY,
//           plantBatch INT,
//           plantSpecies VARCHAR(100),
//           positionLocation INT,
//           positionLayer INT
//           )
//           `;
  
//       await dbConnection.execute(createSensorDetailTable);
//       // await dbConnection.execute(createMicrocontrollerLocationTable);
//       await dbConnection.execute(createPlantBatchTable);
//       // console.log("Tables created or already exists.");
//     } catch (error) {
//       console.log("Error creating table:", error);
//     }
//   }
  
//   async function createTableIfNotExists() {
//     try {
//       const createSensorReadingsTable = `
//         CREATE TABLE IF NOT EXISTS SensorReadings (
//           Datetime DATETIME,
//           MicrocontrollerID INT,
//           PlantBatch INT,
//           Temperature FLOAT,
//           Humidity INT,
//           Brightness INT,
//           pH FLOAT,
//           CO2 FLOAT,
//           EC FLOAT,
//           TDS FLOAT,
//           PRIMARY KEY (Datetime, MicrocontrollerID)
//       );
//     `
//         // Create Microcontroller Plant Pair Table
//       const createMicrocontrollerPlantPairTable = `
//           CREATE TABLE IF NOT EXISTS MicrocontrollerPlantbatchPair (
//           microcontrollerId INT,
//           plantBatch INT
//           )
//        `
//       const createPlantBatchTable = `
//             CREATE TABLE IF NOT EXISTS PlantBatch (
//             plantBatch INT AUTO_INCREMENT PRIMARY KEY,
//             plantID INT,
//             plantLocation INT,
//             quantityPlanted INT,
//             quantityHarvested INT
//             )
//        `
//       const createInventoryTable = `
//         CREATE TABLE IF NOT EXISTS Inventory (
//             InventoryID INT AUTO_INCREMENT PRIMARY KEY,
//             InventoryName VARCHAR(255) UNIQUE,
//             Quantity INT,
//             Units VARCHAR(50)
//       );
//     `
//     const createPlantSeedInventoryTable = `
//       CREATE TABLE IF NOT EXISTS PlantSeedInventory (
//           PlantID INT PRIMARY KEY,
//           Quantity INT
//       );
//     `
//     const createPlantHarverstTable = `
//       CREATE TABLE IF NOT EXISTS PlantHarvest (
//           PlantID INT,
//           Quantity INT,
//           PRIMARY KEY (PlantID)
//       );
//     `
//     const createPlantInfoTable = `
//       CREATE TABLE IF NOT EXISTS PlantInfo (
//           PlantID INT AUTO_INCREMENT PRIMARY KEY,
//           PlantName VARCHAR(255),
//           SensorsRanges INT,
//           DaysToMature INT
//       );
//     `
//     const createTaskTable = `
//       CREATE TABLE IF NOT EXISTS Task (
//           Id INT PRIMARY KEY AUTO_INCREMENT,
//           Action VARCHAR(255),
//           Datetime DATETIME,
//           Status BOOLEAN
//       );
//     `
//     const createAlertSentTable = `
//       CREATE TABLE IF NOT EXISTS AlertsSent (
//           Id INT PRIMARY KEY AUTO_INCREMENT,
//           Action VARCHAR(255),
//           Datetime DATETIME,
//           Status VARCHAR(255),
//           Severity ENUM('Low', 'Medium', 'High'),
//           IsRead BOOLEAN
//       );
//     `
//     const createRemindersTable = `
//       CREATE TABLE IF NOT EXISTS Reminder (
//           Id INT AUTO_INCREMENT PRIMARY KEY,
//           Task VARCHAR(255) NOT NULL,
//           Datetime DATETIME NOT NULL,
//           Status BOOLEAN
//       );
//     `
    
  
//       await dbConnection.execute(createSensorReadingsTable);
//       await dbConnection.execute(createMicrocontrollerPlantPairTable);
//       await dbConnection.execute(createPlantBatchTable);
//       await dbConnection.execute(createInventoryTable);
//       await dbConnection.execute(createPlantSeedInventoryTable);
//       await dbConnection.execute(createPlantHarverstTable);
//       await dbConnection.execute(createPlantInfoTable);
//       await dbConnection.execute(createTaskTable);
//       await dbConnection.execute(createAlertSentTable);
//       await dbConnection.execute(createRemindersTable);
//       // await dbConnection.execute(createMicrocontrollerLocationTable);
//       // await dbConnection.execute(createPlantBatchTable);
//       // console.log("Tables created or already exists.");
//     } catch (error) {
//       console.log("Error creating table:", error);
//     }
//   }

  async function createTableIfNotExistsVersion3() {
    try {
      const createSensorReadingsTable = `
        CREATE TABLE IF NOT EXISTS SensorReadings (
          Datetime DATETIME,
          MicrocontrollerID VARCHAR(20),
          PlantBatchId INT,
          Temperature FLOAT,
          Humidity FLOAT,
          Brightness FLOAT,
          pH FLOAT,
          CO2 FLOAT,
          EC FLOAT,
          TDS FLOAT,
          PRIMARY KEY (Datetime, MicrocontrollerID)
      );
    `
        // Create Microcontroller Plant Pair Table
      const createMicrocontrollerPlantPairTable = `
          CREATE TABLE IF NOT EXISTS MicrocontrollerPlantBatchPair (
          MicrocontrollerId VARCHAR(20) UNIQUE,
          PlantBatchId INT
          )
       `
      const createPlantBatchTable = `
            CREATE TABLE IF NOT EXISTS PlantBatch (
            PlantBatchId INT AUTO_INCREMENT PRIMARY KEY,
            PlantId INT NOT NULL,
            PlantLocation VARCHAR(255),
            QuantityPlanted INT,
            QuantityHarvested INT,
            DatePlanted datetime NOT NULL,
            DateHarvested datetime
            )
       `
      const createInventoryTable = `
        CREATE TABLE IF NOT EXISTS Inventory (
            InventoryId INT AUTO_INCREMENT PRIMARY KEY,
            InventoryName VARCHAR(255),
            Quantity INT,
            Units VARCHAR(50),
            Location VARCHAR(255)
      );
    `
    const createInventoryTable2 = `
        CREATE TABLE IF NOT EXISTS Inventory2 (
            id INT AUTO_INCREMENT PRIMARY KEY,
            item VARCHAR(255),
            quantity FLOAT,
            units VARCHAR(50),
            location VARCHAR(255)
      );
    `
    const createPlantInfoTable = `
      CREATE TABLE IF NOT EXISTS PlantInfo (
          PlantId INT AUTO_INCREMENT PRIMARY KEY,
          PlantName VARCHAR(255),
          PlantPicture BLOB,
          SensorsRanges INT,
          DaysToMature INT,
          CurrentSeedInventory INT DEFAULT 0,
          TotalQuantityHarvested INT DEFAULT 0,
          TotalHarvestSold INT DEFAULT 0,
          TotalHarvestDiscarded INT DEFAULT 0
      );
    `
    const createPlantSensorInfoTable = `
      CREATE TABLE IF NOT EXISTS PlantSensorInfo (
          PlantId INT PRIMARY KEY,
          Temperature_min FLOAT,
          Temperature_max FLOAT,
          Temperature_optimal FLOAT,
          Humidity_min FLOAT,
          Humidity_max FLOAT,
          Humidity_optimal FLOAT,
          Brightness_min FLOAT,
          Brightness_max FLOAT,
          Brightness_optimal FLOAT,
          pH_min FLOAT,
          pH_max FLOAT,
          pH_optimal FLOAT,
          CO2_min FLOAT,
          CO2_max FLOAT,
          CO2_optimal FLOAT,
          EC_min FLOAT,
          EC_max FLOAT,
          EC_optimal FLOAT,
          TDS_min FLOAT,
          TDS_max FLOAT,
          TDS_optimal FLOAT
      );
    `
    const createTaskTable = `
      CREATE TABLE IF NOT EXISTS Task (
          TaskId INT PRIMARY KEY AUTO_INCREMENT,
          Action VARCHAR(255),
          Datetime DATETIME,
          Status BOOLEAN
      );
    `
    const createAlertSentTable = `
      CREATE TABLE IF NOT EXISTS Alert (
          AlertId INT PRIMARY KEY AUTO_INCREMENT,
          Issue VARCHAR(255),
          Datetime DATETIME,
          PlantBatchId INT,
          Severity ENUM('Low', 'Medium', 'High')
      );
    `
    const createRemindersTable = `
      CREATE TABLE IF NOT EXISTS Schedule (
          ScheduleId INT AUTO_INCREMENT PRIMARY KEY,
          ScheduleDescription VARCHAR(255) NOT NULL,
          Datetime DATETIME NOT NULL,
          Status BOOLEAN
      );
    `
    const createScheduleTable = `
        CREATE TABLE IF NOT EXISTS schedule2 (
          ScheduleId INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(255) DEFAULT 'manual',
          content DATETIME,
          task VARCHAR(255)
      );
    `

    const createEnergyConsumingDevicesTable = `
    CREATE TABLE IF NOT EXISTS EnergyConsumingDevice (
      DeviceId INT AUTO_INCREMENT PRIMARY KEY,
      DeviceName VARCHAR(255) DEFAULT 'manual',
      Quantity INT,
      EnergyConsumption FLOAT
  );
`
    
  
      await dbConnection.execute(createSensorReadingsTable);
      await dbConnection.execute(createMicrocontrollerPlantPairTable);
      await dbConnection.execute(createPlantBatchTable);
      await dbConnection.execute(createInventoryTable);
      await dbConnection.execute(createInventoryTable2);
      // await dbConnection.execute(createPlantSeedInventoryTable);
      // await dbConnection.execute(createPlantHarverstTable);
      await dbConnection.execute(createPlantInfoTable);
      await dbConnection.execute(createPlantSensorInfoTable);
      await dbConnection.execute(createTaskTable);
      await dbConnection.execute(createAlertSentTable);
      await dbConnection.execute(createRemindersTable);
      await dbConnection.execute(createScheduleTable);
      await dbConnection.execute(createEnergyConsumingDevicesTable);
      // await dbConnection.execute(createMicrocontrollerLocationTable);
      // await dbConnection.execute(createPlantBatchTable);
      // console.log("Tables created or already exists.");
    } catch (error) {
      console.log("Error creating table:", error);
    }
  }
  
  
  // async function insertSensorValues(dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness){
  //   await dbConnection.execute('INSERT INTO SensorDetail (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (?, ?, ?, ?, ?, ?)',
  //       [dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness]);
  // }
  
  // async function getSensorDataByMicrocontrollerId(microcontrollerId){
  //   queryResult = await dbConnection.promise().query('SELECT * FROM SensorDetail WHERE microcontrollerId = ?', (microcontrollerId));
  //   return queryResult;
  // }
  
  // async function getAllSensorData(){
  //   queryResult = await dbConnection.promise().query('SELECT * FROM SensorDetail');
  //   // console.log("hahahahha");
  //   // console.log(queryResult);
  //   return queryResult;
  // }
  // Reassign more meaningful function name
  async function dropAllTableMySQLVersion1(){
    const tablesToDrop = [
      "alert",
      "inventory",
      "microcontrollerplantbatchpair",
      "plantbatch",
      "plantinfo",
      "schedule",
      "sensorreadings",
      "task",
    ];

    // connection.connect();

    // Loop through the array of tables and drop each one
    for (const tableName of tablesToDrop) {
      const dropTableQuery = `DROP TABLE IF EXISTS ${tableName}`;
      await new Promise((resolve, reject) => {
        dbConnection.execute(dropTableQuery, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
  initialiseMySQL = createTableIfNotExistsVersion3;
  dropAllTableMySQL = dropAllTableMySQLVersion1;
  module.exports = {
    // insertSensorValues,
    // getSensorDataByMicrocontrollerId,
    // getAllSensorData,
    initialiseMySQL,
    dropAllTableMySQL,
  };