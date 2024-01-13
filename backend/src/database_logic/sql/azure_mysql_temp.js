const mssql = require('mssql');
const {MYSQL} = require("../../env.js");

dbConnection = new mssql.ConnectionPool({
host: MYSQL.HOST,
user: MYSQL.USER,
password: MYSQL.PASSWORD,
database: MYSQL.DATABASE,
waitForConnections: true,
connectionLimit: 10, // Adjust according to your needs
queueLimit: 0,
});
request = dbConnection.request();

export default class Database {
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
        this.poolconnection = await sql.connect(this.config);
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

  async executeQuery(query) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(query);

    return result.rowsAffected[0];
  }

  async create(data) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input('firstName', sql.NVarChar(255), data.firstName);
    request.input('lastName', sql.NVarChar(255), data.lastName);

    const result = await request.query(
      `INSERT INTO Person (firstName, lastName) VALUES (@firstName, @lastName)`
    );

    return result.rowsAffected[0];
  }

  async readAll() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM Person`);

    return result.recordsets[0];
  }

  async read(id) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request
      .input('id', sql.Int, +id)
      .query(`SELECT * FROM Person WHERE id = @id`);

    return result.recordset[0];
  }

  async update(id, data) {
    await this.connect();

    const request = this.poolconnection.request();

    request.input('id', sql.Int, +id);
    request.input('firstName', sql.NVarChar(255), data.firstName);
    request.input('lastName', sql.NVarChar(255), data.lastName);

    const result = await request.query(
      `UPDATE Person SET firstName=@firstName, lastName=@lastName WHERE id = @id`
    );

    return result.rowsAffected[0];
  }

  async delete(id) {
    await this.connect();

    const idAsNumber = Number(id);

    const request = this.poolconnection.request();
    const result = await request
      .input('id', sql.Int, idAsNumber)
      .query(`DELETE FROM Person WHERE id = @id`);

    return result.rowsAffected[0];
  }

  async createTableIfNotExists() {
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
  
  async insertSensorValues(dateTime,microcontrollerId, plantBatch, temperature,humidity,brightness){
    await dbConnection.execute('INSERT INTO SensorDetail (dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness) VALUES (?, ?, ?, ?, ?, ?)',
        [dateTime, microcontrollerId, plantBatch, temperature, humidity, brightness]);
  }
  
  async getSensorDataByMicrocontrollerId(microcontrollerId){
    queryResult = await dbConnection.promise().query('SELECT * FROM SensorDetail WHERE microcontrollerId = ?', (microcontrollerId));
    return queryResult;
  }
  
  async getAllSensorData(){
    queryResult = await dbConnection.promise().query('SELECT * FROM SensorDetail');
    // console.log("hahahahha");
    // console.log(queryResult);
    return queryResult;
  }
  // Reassign more meaningful function name
  initialiseMySQL = createTableIfNotExists;
  
}


module.exports = {
    Database,
}