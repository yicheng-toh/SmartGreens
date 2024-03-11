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
                Datetime DATETIME NOT NULL,
                MicrocontrollerID VARCHAR NOT NULL,
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
                Location VARCHAR(255)
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
        let request = await dbConnection.connect();
        

        await request.query(createSensorReadingsTable);
        request = await dbConnection.connect();
        await request.query(createMicrocontrollerPlantPairTable);
        request = await dbConnection.connect();
        await request.query(createPlantBatchTable);
        request = await dbConnection.connect();
        await request.query(createInventoryTable);
        request = await dbConnection.connect();
        // await request.query(createPlantSeedInventoryTable);
        // await request.query(createPlantHarvestTable);
        await request.query(createPlantInfoTable);
        request = await dbConnection.connect();
        await request.query(createTaskTable);
        request = await dbConnection.connect();
        await request.query(createAlertTable);
        request = await dbConnection.connect();
        await request.query(createScheduleTable);

        console.log("Tables created or already exist.");
        dbConnection.disconnect();
    } catch (error) {
        console.log("Error creating table:", error);
    }
}

async function createTableIfNotExistsVersion4() {
    try {
        
        // Create SensorReadings Table
        const createSensorReadingsQuery = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SensorReadings')
            BEGIN
                CREATE TABLE SensorReadings (
                    Datetime DATETIME NOT NULL,
                    MicrocontrollerID INT NOT NULL,
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
            END
        `;

        // Create MicrocontrollerPlantBatchPair Table
        const createMicrocontrollerPlantBatchPairQuery = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MicrocontrollerPlantBatchPair')
            BEGIN
                CREATE TABLE MicrocontrollerPlantBatchPair (
                    MicrocontrollerId INT,
                    PlantBatchId INT
                );
            END
        `;

        // Create PlantBatch Table
        const createPlantBatchQuery = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PlantBatch')
            BEGIN
                CREATE TABLE PlantBatch (
                    PlantBatchId INT PRIMARY KEY IDENTITY(1,1),
                    PlantId INT NOT NULL,
                    PlantLocation INT,
                    QuantityPlanted INT,
                    QuantityHarvested INT,
                    DatePlanted DATETIME NOT NULL,
                    DateHarvested DATETIME
                );
            END
        `;

        // Create Inventory Table
        const createInventoryQuery = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inventory')
            BEGIN
                CREATE TABLE Inventory (
                    InventoryId INT PRIMARY KEY IDENTITY(1,1),
                    InventoryName VARCHAR(255) UNIQUE,
                    Quantity INT,
                    Units VARCHAR(50),
                    Location INT
                );
            END
        `;

        // Create PlantInfo Table
        const createPlantInfoQuery = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PlantInfo')
            BEGIN
                CREATE TABLE PlantInfo (
                    PlantId INT PRIMARY KEY IDENTITY(1,1),
                    PlantName VARCHAR(255),
                    PlantPicture VARBINARY(MAX),
                    SensorsRanges INT,
                    DaysToMature INT,
                    CurrentSeedInventory INT DEFAULT 0,
                    TotalHarvestSold INT DEFAULT 0,
                    TotalHarvestDiscarded INT DEFAULT 0
                );
            END
        `;

        // Create Task Table
        const createTaskQuery = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Task')
            BEGIN
                CREATE TABLE Task (
                    TaskId INT PRIMARY KEY IDENTITY(1,1),
                    Action VARCHAR(255),
                    Datetime DATETIME,
                    Status BIT
                );
            END
        `;

        // Create Alert Table
        const createAlertQuery = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Alert')
            BEGIN
                CREATE TABLE Alert (
                    AlertId INT PRIMARY KEY IDENTITY(1,1),
                    Issue VARCHAR(255),
                    Datetime DATETIME,
                    PlantBatchId INT,
                    Severity VARCHAR(50) CHECK (Severity IN ('Low', 'Medium', 'High'))
                );
            END
        `;

        // Create Schedule Table
        const createScheduleQuery = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Schedule')
            BEGIN
                CREATE TABLE Schedule (
                    ScheduleId INT PRIMARY KEY IDENTITY(1,1),
                    ScheduleDescription VARCHAR(255) NOT NULL,
                    Datetime DATETIME NOT NULL,
                    Status BIT
                );
            END
        `;
        const dbConnection = await createDbConnection();
        let request = await dbConnection.connect();
        // Execute all queries
        await request.query(createSensorReadingsQuery);
        request = await dbConnection.connect();
        await request.query(createMicrocontrollerPlantBatchPairQuery);
        request = await dbConnection.connect();
        await request.query(createPlantBatchQuery);
        request = await dbConnection.connect();
        await request.query(createInventoryQuery);
        request = await dbConnection.connect();
        await request.query(createPlantInfoQuery);
        request = await dbConnection.connect();
        await request.query(createTaskQuery);
        request = await dbConnection.connect();
        await request.query(createAlertQuery);
        request = await dbConnection.connect();
        await request.query(createScheduleQuery);

        console.log("Tables created or already exist.");
        await dbConnection.disconnect();
        // dbConnection.disconnect();
    } catch (error) {
        console.error("Error creating table:", error.message);
    }
}

async function dropAllTableMySQLVersion1() {
    try {
        const dbConnection = await createDbConnection();
        const request = await dbConnection.connect();

        // Drop SensorReadings Table
        const dropSensorReadingsQuery = `
            IF OBJECT_ID('[dbo].[SensorReadings]', 'U') IS NOT NULL
                DROP TABLE [dbo].[SensorReadings];
        `;

        // Drop MicrocontrollerPlantBatchPair Table
        const dropMicrocontrollerPlantBatchPairQuery = `
            IF OBJECT_ID('dbo.MicrocontrollerPlantBatchPair', 'U') IS NOT NULL
                DROP TABLE dbo.MicrocontrollerPlantBatchPair;
        `;

        // Drop PlantBatch Table
        const dropPlantBatchQuery = `
            IF OBJECT_ID('dbo.PlantBatch', 'U') IS NOT NULL
                DROP TABLE dbo.PlantBatch;
        `;

        // Drop Inventory Table
        const dropInventoryQuery = `
            IF OBJECT_ID('dbo.Inventory', 'U') IS NOT NULL
                DROP TABLE dbo.Inventory;
        `;

        // Drop PlantInfo Table
        const dropPlantInfoQuery = `
            IF OBJECT_ID('dbo.PlantInfo', 'U') IS NOT NULL
                DROP TABLE dbo.PlantInfo;
        `;

        // Drop Task Table
        const dropTaskQuery = `
            IF OBJECT_ID('dbo.Task', 'U') IS NOT NULL
                DROP TABLE dbo.Task;
        `;

        // Drop Alert Table
        const dropAlertQuery = `
            IF OBJECT_ID('dbo.Alert', 'U') IS NOT NULL
                DROP TABLE dbo.Alert;
        `;

        // Drop Schedule Table
        const dropScheduleQuery = `
            IF OBJECT_ID('dbo.Schedule', 'U') IS NOT NULL
                DROP TABLE dbo.Schedule;
        `;

        // Execute drop queries
        await request.query(dropSensorReadingsQuery);
        await request.query(dropMicrocontrollerPlantBatchPairQuery);
        await request.query(dropPlantBatchQuery);
        await request.query(dropInventoryQuery);
        await request.query(dropPlantInfoQuery);
        await request.query(dropTaskQuery);
        await request.query(dropAlertQuery);
        await request.query(dropScheduleQuery);

        console.log("Tables dropped successfully.");
        await dbConnection.disconnect();
        // dbConnection.disconnect();
    } catch (error) {
        console.error("Error dropping tables:", error.message);
    }
}

async function createTablesIfNotExistVersion5() {
    try {
        const dbConnection = await createDbConnection();
        const request = await dbConnection.connect();

        const sqlScript = `
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SensorReadings')
        BEGIN
            CREATE TABLE SensorReadings (
                Datetime DATETIME NOT NULL,
                MicrocontrollerID VARCHAR(20) NOT NULL,
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
        END;
        

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MicrocontrollerPlantBatchPair')
        BEGIN
            CREATE TABLE MicrocontrollerPlantBatchPair (
                MicrocontrollerId VARCHAR(20) UNIQUE,
                PlantBatchId INT
            );
        END;
        

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PlantBatch')
        BEGIN
            CREATE TABLE PlantBatch (
                PlantBatchId INT PRIMARY KEY IDENTITY(1,1),
                PlantId INT NOT NULL,
                PlantLocation VARCHAR(255),
                QuantityPlanted INT,
                QuantityHarvested INT,
                DatePlanted DATETIME NOT NULL,
                DateHarvested DATETIME
            );
        END;
        

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inventory')
        BEGIN
            CREATE TABLE Inventory (
                InventoryId INT PRIMARY KEY IDENTITY(1,1),
                InventoryName VARCHAR(255) UNIQUE,
                Quantity INT,
                Units VARCHAR(50),
                Location VARCHAR(255)
            );
        END;

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inventory2')
        BEGIN
            CREATE TABLE Inventory2 (
                id INT IDENTITY(1,1) PRIMARY KEY,
                item VARCHAR(255),
                quantity FLOAT,
                units VARCHAR(50),
                location VARCHAR(255)
            );
        END;

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PlantInfo')
        BEGIN
            CREATE TABLE PlantInfo (
                PlantId INT PRIMARY KEY IDENTITY(1,1),
                PlantName VARCHAR(255),
                PlantPicture VARBINARY(MAX),
                SensorsRanges INT,
                DaysToMature INT,
                CurrentSeedInventory INT DEFAULT 0,
                TotalHarvestSold INT DEFAULT 0,
                TotalHarvestDiscarded INT DEFAULT 0
            );
        END;

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PlantSensorInfo')
        BEGIN
            CREATE TABLE PlantSensorInfo (
                PlantId INT UNIQUE,
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
        END;

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Task')
        BEGIN
            CREATE TABLE Task (
                TaskId INT PRIMARY KEY IDENTITY(1,1),
                Action VARCHAR(255),
                Datetime DATETIME,
                Status BIT
            );
        END;

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Alert')
        BEGIN
            CREATE TABLE Alert (
                AlertId INT PRIMARY KEY IDENTITY(1,1),
                Issue VARCHAR(255),
                Datetime DATETIME,
                PlantBatchId INT,
                Severity VARCHAR(50) CHECK (Severity IN ('Low', 'Medium', 'High'))
            );
        END;

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Schedule')
        BEGIN
            CREATE TABLE Schedule (
                ScheduleId INT PRIMARY KEY,
                ScheduleDescription VARCHAR(255) NOT NULL,
                Datetime DATETIME NOT NULL,
                Status BIT
            );
        END;

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Schedule2')
        BEGIN
            CREATE TABLE Schedule2(
                ScheduleId INT IDENTITY(1,1) PRIMARY KEY,
                Type VARCHAR(255) DEFAULT 'manual',
                Content DATETIME,
                Task VARCHAR(255)
            );
        END;
        
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'EnergyConsumingDevice')
        BEGIN
            CREATE TABLE EnergyConsumingDevice (
                DeviceId INT PRIMARY KEY IDENTITY(1,1),
                DeviceName VARCHAR(255) not NULL,
                Quantity INT DEFAULT 0 CHECK (Quantity >= 0),
                EnergyConsumption FLOAT DEFAULT 0
            );
        END;
    `;

        // Execute the entire script
        // await request.batch(sqlScript);
        await request.query(sqlScript);

        console.log("Tables created or already exist.");
        await dbConnection.disconnect();
    } catch (error) {
        console.error("Error creating tables:", error.message);
    }
}




// Reassign more meaningful function name
initialiseMySQL = createTablesIfNotExistVersion5;
dropAllTableMySQL = dropAllTableMySQLVersion1;

module.exports = {
// insertSensorValues,
// getSensorDataByMicrocontrollerId,
// getAllSensorData,
initialiseMySQL,
dropAllTableMySQL,
};