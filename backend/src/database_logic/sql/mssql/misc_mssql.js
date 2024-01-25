//This file should contain the creation for all the database.
const {createDbConnection} = require("./mssql.js");


// async function createTableIfNotExistsTemp() {
// try {
//     const createSensorReadingsTable = `
//     CREATE TABLE IF NOT EXISTS SensorReadings (
//         Datetime DATETIME,
//         MicrocontrollerID INT,
//         PlantBatch INT,
//         Temperature FLOAT,
//         Humidity INT,
//         Brightness INT,
//         pH FLOAT,
//         CO2 FLOAT,
//         EC FLOAT,
//         TDS FLOAT,
//         PRIMARY KEY (Datetime, MicrocontrollerID)
//         );
//     `
//     // Create Microcontroller Plant Pair Table
//     const createMicrocontrollerPlantPairTable = `
//         CREATE TABLE IF NOT EXISTS MicrocontrollerPlantbatchPair (
//         microcontrollerId INT,
//         plantBatch INT
//         )
//     `
//     const createPlantBatchTable = `
//         CREATE TABLE IF NOT EXISTS PlantBatch (
//         plantBatch INT AUTO_INCREMENT PRIMARY KEY,
//         plantID INT,
//         plantLocation INT,
//         quantityPlanted INT,
//         quantityHarvested INT
//         )
//     `
//     const createInventoryTable = `
//         CREATE TABLE IF NOT EXISTS Inventory (
//             InventoryID INT AUTO_INCREMENT PRIMARY KEY,
//             InventoryName VARCHAR(255),
//             Quantity INT,
//             Units VARCHAR(50)
//         );
//     `
//     const createPlantSeedInventoryTable = `
//         CREATE TABLE IF NOT EXISTS PlantSeedInventory (
//             PlantID INT PRIMARY KEY,
//             Quantity INT
//         );
//     `
//     const createPlantHarverstTable = `
//         CREATE TABLE IF NOT EXISTS PlantHarvest (
//             PlantID INT,
//             Quantity INT,
//             PRIMARY KEY (PlantID)
//         );
//     `
//     const createPlantInfoTable = `
//         CREATE TABLE IF NOT EXISTS PlantInfo (
//             PlantID INT AUTO_INCREMENT PRIMARY KEY,
//             PlantName VARCHAR(255),
//             SensorsRanges INT,
//             DaysToMature INT
//         );
//     `
//     const createTaskTable = `
//         CREATE TABLE IF NOT EXISTS Task (
//             Id INT PRIMARY KEY AUTO_INCREMENT,
//             Action VARCHAR(255),
//             Datetime DATETIME,
//             Status BOOLEAN
//         );
//     `
//     const createAlertSentTable = `
//         CREATE TABLE IF NOT EXISTS AlertsSent (
//             Id INT PRIMARY KEY AUTO_INCREMENT,
//             Action VARCHAR(255),
//             Datetime DATETIME,
//             Status VARCHAR(255),
//             Severity ENUM('Low', 'Medium', 'High'),
//             IsRead BOOLEAN
//         );
//     `
//     const createRemindersTable = `
//         CREATE TABLE IF NOT EXISTS Reminders (
//             Id INT AUTO_INCREMENT PRIMARY KEY,
//             Task VARCHAR(255),
//             Datetime DATETIME,
//             Status BOOLEAN
//         );
//     `


//         await dbConnection.execute(createSensorReadingsTable);
//         await dbConnection.execute(createMicrocontrollerPlantPairTable);
//         await dbConnection.execute(createPlantBatchTable);
//         await dbConnection.execute(createInventoryTable);
//         await dbConnection.execute(createPlantSeedInventoryTable);
//         await dbConnection.execute(createPlantHarverstTable);
//         await dbConnection.execute(createPlantInfoTable);
//         await dbConnection.execute(createTaskTable);
//         await dbConnection.execute(createAlertSentTable);
//         await dbConnection.execute(createRemindersTable);
//         // await dbConnection.execute(createMicrocontrollerLocationTable);
//         // await dbConnection.execute(createPlantBatchTable);
//         // console.log("Tables created or already exists.");
//     } catch (error) {
//         console.log("Error creating table:", error);
//     }
// }

// async function createTableIfNotExists() {
    
//     try {
//         // Create SensorReadings Table
        
//         const createSensorReadingsTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SensorReadings')
//             BEGIN
//                 CREATE TABLE SensorReadings (
//                     Datetime DATETIME,
//                     MicrocontrollerID INT,
//                     PlantBatch INT,
//                     Temperature FLOAT,
//                     Humidity INT,
//                     Brightness INT,
//                     pH FLOAT,
//                     CO2 FLOAT,
//                     EC FLOAT,
//                     TDS FLOAT,
//                     PRIMARY KEY (Datetime, MicrocontrollerID)
//                 );
//             END;
//         `;

//         // Create MicrocontrollerPlantbatchPair Table
//         const createMicrocontrollerPlantPairTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MicrocontrollerPlantbatchPair')
//             BEGIN
//                 CREATE TABLE MicrocontrollerPlantbatchPair (
//                     microcontrollerId INT,
//                     plantBatch INT
//                 );
//             END;
//         `;

//         // Create PlantBatch Table
//         const createPlantBatchTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PlantBatch')
//             BEGIN
//                 CREATE TABLE PlantBatch (
//                     plantBatch INT PRIMARY KEY IDENTITY(1,1),
//                     plantID INT,
//                     plantLocation INT,
//                     quantityPlanted INT,
//                     quantityHarvested INT
//                 );
//             END;
//         `;

//         // Create Inventory Table
//         const createInventoryTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inventory')
//             BEGIN
//                 CREATE TABLE Inventory (
//                     InventoryID INT PRIMARY KEY IDENTITY(1,1),
//                     InventoryName VARCHAR(255),
//                     Quantity INT,
//                     Units VARCHAR(50)
//                 );
//             END;
//         `;

//         // Create PlantSeedInventory Table
//         const createPlantSeedInventoryTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PlantSeedInventory')
//             BEGIN
//                 CREATE TABLE PlantSeedInventory (
//                     PlantID INT PRIMARY KEY,
//                     Quantity INT
//                 );
//             END;
//         `;

//         // Create PlantHarvest Table
//         const createPlantHarvestTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PlantHarvest')
//             BEGIN
//                 CREATE TABLE PlantHarvest (
//                     PlantID INT,
//                     Quantity INT,
//                     PRIMARY KEY (PlantID)
//                 );
//             END;
//         `;

//         // Create PlantInfo Table
//         const createPlantInfoTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PlantInfo')
//             BEGIN
//                 CREATE TABLE PlantInfo (
//                     PlantID INT PRIMARY KEY IDENTITY(1,1),
//                     PlantName VARCHAR(255),
//                     SensorsRanges INT,
//                     DaysToMature INT
//                 );
//             END;
//         `;

//         // Create Task Table
//         const createTaskTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Task')
//             BEGIN
//                 CREATE TABLE Task (
//                     Id INT PRIMARY KEY IDENTITY(1,1),
//                     Action VARCHAR(255),
//                     Datetime DATETIME,
//                     Status BIT
//                 );
//             END;
//         `;

//         // Create AlertsSent Table
//         const createAlertSentTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AlertsSent')
//             BEGIN
//                 CREATE TABLE AlertsSent (
//                     Id INT PRIMARY KEY IDENTITY(1,1),
//                     Action VARCHAR(255),
//                     Datetime DATETIME,
//                     Status VARCHAR(255),
//                     Severity VARCHAR(10) CHECK (Severity IN ('Low', 'Medium', 'High')),
//                     IsRead BIT
//                 );
//             END;
//         `;

//         // Create Reminders Table
//         const createRemindersTable = `
//             IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Reminders')
//             BEGIN
//                 CREATE TABLE Reminders (
//                     Id INT PRIMARY KEY IDENTITY(1,1),
//                     Task VARCHAR(255),
//                     Datetime DATETIME,
//                     Status BIT
//                 );
//             END;
//         `;
//         const dbConnection = await createDbConnection();
//         const request = await dbConnection.connect();

//         await request.query(createSensorReadingsTable);
//         await request.query(createMicrocontrollerPlantPairTable);
//         await request.query(createPlantBatchTable);
//         await request.query(createInventoryTable);
//         await request.query(createPlantSeedInventoryTable);
//         await request.query(createPlantHarvestTable);
//         await request.query(createPlantInfoTable);
//         await request.query(createTaskTable);
//         await request.query(createAlertSentTable);
//         await request.query(createRemindersTable);

//         console.log("Tables created or already exist.");
//         await dbConnection.disconnect();
//     } catch (error) {
//         console.log("Error creating table:", error);
//     }
// }

async function createTableIfNotExistsVersion3() {
    
    try {
        // Create SensorReadings Table
        const createSensorReadingsTable = `
            CREATE TABLE IF NOT EXISTS SensorReadings (
                Datetime DATETIME,
                MicrocontrollerID INT,
                PlantBatchId INT,
                Temperature FLOAT,
                Humidity INT,
                Brightness INT,
                pH FLOAT,
                CO2 FLOAT,
                EC FLOAT,
                TDS FLOAT,
                PRIMARY KEY (Datetime, MicrocontrollerID)
            );
        `;

        // Create MicrocontrollerPlantBatchPair Table
        const createMicrocontrollerPlantPairTable = `
            CREATE TABLE IF NOT EXISTS MicrocontrollerPlantBatchPair (
                MicrocontrollerId INT,
                PlantBatchId INT
            );
        `;

        // Create PlantBatch Table
        const createPlantBatchTable = `
            CREATE TABLE IF NOT EXISTS PlantBatch (
                PlantBatchId INT PRIMARY KEY IDENTITY(1,1),
                PlantId INT NOT NULL,
                PlantLocation INT,
                QuantityPlanted INT,
                QuantityHarvested INT,
                DatePlanted DATETIME NOT NULL,
                DateHarvested DATETIME
            );
        `;

        // Create Inventory Table
        const createInventoryTable = `
            CREATE TABLE IF NOT EXISTS Inventory (
                InventoryId INT PRIMARY KEY IDENTITY(1,1),
                InventoryName VARCHAR(255) UNIQUE,
                Quantity INT,
                Units VARCHAR(50),
                Location INT
            );
        `;

        // Create PlantInfo Table
        //Total quantity harvesetd means the number of plant collected. This may be collected from plant batch...
        // TotalQuantityHarvested INT DEFAULT 0,
        const createPlantInfoTable = `
            CREATE TABLE IF NOT EXISTS PlantInfo (
                PlantId INT PRIMARY KEY IDENTITY(1,1),
                PlantName VARCHAR(255),
                PlantPicture VARBINARY(MAX),
                SensorsRanges INT,
                DaysToMature INT,
                CurrentSeedInventory INT DEFAULT 0,
                TotalHarvestSold INT DEFAULT 0,
                TotalHarvestDiscarded INT DEFAULT 0
            );
        `;

        // Create Task Table
        const createTaskTable = `
            CREATE TABLE IF NOT EXISTS Task (
                TaskId INT PRIMARY KEY IDENTITY(1,1),
                Action VARCHAR(255),
                Datetime DATETIME,
                Status BOOLEAN
            );
        `;

        // Create Alert Table
        const createAlertTable = `
            CREATE TABLE IF NOT EXISTS Alert (
                AlertId INT PRIMARY KEY IDENTITY(1,1),
                Issue VARCHAR(255),
                Datetime DATETIME,
                PlantBatchId INT,
                Severity VARCHAR(50) CHECK (Severity IN ('Low', 'Medium', 'High'))
            );
        `;

        // Create Schedule Table
        const createScheduleTable = `
            CREATE TABLE IF NOT EXISTS Schedule (
                ScheduleId INT PRIMARY KEY IDENTITY(1,1),
                ScheduleDescription VARCHAR(255) NOT NULL,
                Datetime DATETIME NOT NULL,
                Status BOOLEAN
            );
        `;
        const dbConnection = await createDbConnection();
        const request = await dbConnection.connect();

        await request.query(createSensorReadingsTable);
        await request.query(createMicrocontrollerPlantPairTable);
        await request.query(createPlantBatchTable);
        await request.query(createInventoryTable);
        // await request.query(createPlantSeedInventoryTable);
        // await request.query(createPlantHarvestTable);
        await request.query(createPlantInfoTable);
        await request.query(createTaskTable);
        await request.query(createAlertTable);
        await request.query(createScheduleTable);

        console.log("Tables created or already exist.");
        await dbConnection.disconnect();
    } catch (error) {
        console.log("Error creating table:", error);
    }
}


// Reassign more meaningful function name
initialiseMySQL = createTableIfNotExistsVersion3;

module.exports = {
// insertSensorValues,
// getSensorDataByMicrocontrollerId,
// getAllSensorData,
initialiseMySQL,
};