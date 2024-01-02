const mssql = require('mssql');
const {MYSQL} = require("../env.js");

// import * as dotenv from 'dotenv';
// dotenv.config({ path: `.env.${process.env.NODE_ENV}`, debug: true });

const server = process.env.AZURE_SQL_SERVER;
const database = process.env.AZURE_SQL_DATABASE;
const port = parseInt(process.env.AZURE_SQL_PORT);
const user = process.env.AZURE_SQL_USER;
const password = process.env.AZURE_SQL_PASSWORD;

const config = {
    server,
    port,
    database,
    user,
    password,
    options: {
        encrypt: true
    }
};


class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
    console.log(`Database: config: ${JSON.stringify(config)}`);
  }

  async connect() {
    try {
      console.log(`Database connecting...${this.connected}`);
      if (this.connected === false) {
        this.poolconnection = await mssql.connect(this.config);
        this.connected = true;
        console.log('Database connection successful');
      } else {
        console.log('Database already connected');
      }
    } catch (error) {
      console.error(`Error connecting to database: ${JSON.stringify(error)}`);
    }
  }

  async disconnect() {
    try {
      this.poolconnection.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error(`Error closing database connection: ${error}`);
    }
  }

  async initialiseMySQL() {
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
      await this.connect();
      const request = this.poolconnection.request();
      await request.query(createSensorDetailTable);
      await request.query(createPlantBatchTable);
      await request.query(createMicrocontrollerPlantPairTable);
      await this.disconnect();
      // await dbConnection.execute(createSensorDetailTable);
      // // await dbConnection.execute(createMicrocontrollerLocationTable);
      // await dbConnection.execute(createPlantBatchTable);
      // // console.log("Tables created or already exists.");
    } catch (error) {
      console.error("Error creating table:", error);
    }
  }
  
  async insertSensorValues(dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness){
    // await dbConnection.execute('INSERT INTO SensorDetail (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (?, ?, ?, ?, ?, ?)',
    //     [dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness]);
    try {

      await this.connect();
      const request = this.poolconnection.request();
      
      // Named parameters
      await request.input('dateTime', mssql.DateTime, dateTime)
        .input('microcontrollerId', mssql.Int, microcontrollerId)
        .input('plantBatch', mssql.Int, plantBatch)
        .input('temperature', mssql.Float, temperature)
        .input('humidity', mssql.Int, humidity)
        .input('brightness', mssql.Int, brightness)
        .query(`
          INSERT INTO SensorDetail (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness)
          VALUES (@dateTime, @microcontrollerId, @plantBatch, @temperature, @humidity, @brightness)
        `);
        await this.disconnect();
    } catch (error) {
      console.error('Error executing insert query:', error);
    }
  }
  
  async getSensorDataByMicrocontrollerId(microcontrollerId){
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('microcontrollerId', mssql.Int, +microcontrollerId)
      .query(`SELECT * FROM Person WHERE id = @microcontrollerId`);
    await this.disconnect();
    return result;
  }
  
  async getAllSensorData(){
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query('SELECT * FROM SensorDetail');
    await this.disconnect();
    // console.log("hahahahha");
    // console.log(queryResult);
    return result;
  }
}

const dbConnection = new Database(config);
module.exports = dbConnection;

  // // Reassign more meaningful function name
  // initialiseMySQL = createTableIfNotExists;
  



module.exports = {
    Database,
}