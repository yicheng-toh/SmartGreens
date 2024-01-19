const {dbConnection} = require("./mysql.js");

// Function to create the BASESENSOR table if it doesn't exist
async function createTableIfNotExistsScrapped() {
    try {
     
      // Create the Sensor Detail table
      const createSensorDetailTable = `
          CREATE TABLE IF NOT EXISTS SensorDetail (
          dateTime DATETIME,
          microcontrollerId INT,
          plantBatch INT,
          temperature FLOAT,
          humidity INT,
          brightness INT
          )
          `;
      
      // Create Microcontroller Plant Pair Table
      const createMicrocontrollerPlantPairTable = `
          CREATE TABLE IF NOT EXISTS MicrocontrollerPlantbatchPair (
          microcontrollerId INT,
          plantBatch INT,
          )
          `;
  
      // Create the Plant Batch table
      const createPlantBatchTable = `
          CREATE TABLE IF NOT EXISTS PlantDetail (
          id INT AUTO_INCREMENT PRIMARY KEY,
          plantBatch INT,
          plantSpecies VARCHAR(100),
          positionLocation INT,
          positionLayer INT
          )
          `;
  
      await dbConnection.execute(createSensorDetailTable);
      // await dbConnection.execute(createMicrocontrollerLocationTable);
      await dbConnection.execute(createPlantBatchTable);
      // console.log("Tables created or already exists.");
    } catch (error) {
      console.error("Error creating table:", error);
    }
  }
  
  async function createTableIfNotExists() {
    try {
      const createSensorReadingsTable = `
        CREATE TABLE IF NOT EXISTS SensorReadings (
          Datetime DATETIME,
          MicrocontrollerID INT,
          PlantBatch INT,
          Temperature FLOAT,
          Humidity INT,
          Brightness INT,
          pH FLOAT,
          CO2 FLOAT,
          EC FLOAT,
          TDS FLOAT,
          PRIMARY KEY (Datetime, MicrocontrollerID)
      );
    `
        // Create Microcontroller Plant Pair Table
      const createMicrocontrollerPlantPairTable = `
          CREATE TABLE IF NOT EXISTS MicrocontrollerPlantbatchPair (
          microcontrollerId INT,
          plantBatch INT
          )
       `
      const createPlantBatchTable = `
            CREATE TABLE IF NOT EXISTS PlantBatch (
            plantBatch INT AUTO_INCREMENT PRIMARY KEY,
            plantID INT,
            plantLocation INT,
            quantityPlanted INT,
            quantityHarvested INT
            )
       `
      const createInventoryTable = `
        CREATE TABLE IF NOT EXISTS Inventory (
            InventoryID INT AUTO_INCREMENT PRIMARY KEY,
            InventoryName VARCHAR(255),
            Quantity INT,
            Units VARCHAR(50)
      );
    `
    const createPlantSeedInventoryTable = `
      CREATE TABLE IF NOT EXISTS PlantSeedInventory (
          PlantID INT PRIMARY KEY,
          Quantity INT
      );
    `
    const createPlantHarverstTable = `
      CREATE TABLE IF NOT EXISTS PlantHarvest (
          PlantID INT,
          Quantity INT,
          PRIMARY KEY (PlantID)
      );
    `
    const createPlantInfoTable = `
      CREATE TABLE IF NOT EXISTS PlantInfo (
          PlantID INT AUTO_INCREMENT PRIMARY KEY,
          PlantName VARCHAR(255),
          SensorsRanges INT,
          DaysToMature INT
      );
    `
    const createTaskTable = `
      CREATE TABLE IF NOT EXISTS Task (
          Id INT PRIMARY KEY AUTO_INCREMENT,
          Action VARCHAR(255),
          Datetime DATETIME,
          Status BOOLEAN
      );
    `
    const createAlertSentTable = `
      CREATE TABLE IF NOT EXISTS AlertsSent (
          Id INT PRIMARY KEY AUTO_INCREMENT,
          Action VARCHAR(255),
          Datetime DATETIME,
          Status VARCHAR(255),
          Severity ENUM('Low', 'Medium', 'High'),
          IsRead BOOLEAN
      );
    `
    const createRemindersTable = `
      CREATE TABLE IF NOT EXISTS Reminders (
          Id INT AUTO_INCREMENT PRIMARY KEY,
          Task VARCHAR(255) NOT NULL,
          Datetime DATETIME NOT NULL,
          Status BOOLEAN
      );
    `
    
  
      await dbConnection.execute(createSensorReadingsTable);
      await dbConnection.execute(createMicrocontrollerPlantPairTable);
      await dbConnection.execute(createPlantBatchTable);
      await dbConnection.execute(createInventoryTable);
      await dbConnection.execute(createPlantSeedInventoryTable);
      await dbConnection.execute(createPlantHarverstTable);
      await dbConnection.execute(createPlantInfoTable);
      await dbConnection.execute(createTaskTable);
      await dbConnection.execute(createAlertSentTable);
      await dbConnection.execute(createRemindersTable);
      // await dbConnection.execute(createMicrocontrollerLocationTable);
      // await dbConnection.execute(createPlantBatchTable);
      // console.log("Tables created or already exists.");
    } catch (error) {
      console.error("Error creating table:", error);
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
  initialiseMySQL = createTableIfNotExists;

  module.exports = {
    // insertSensorValues,
    // getSensorDataByMicrocontrollerId,
    // getAllSensorData,
    initialiseMySQL,
  };