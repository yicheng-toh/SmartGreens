const sql = require("mssql");
// const {config} = require("./config.js");
const {config} = require("../../../env.js");


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
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
        console.log('Database connection successful');
      } else {
        console.log('Database already connected');
      }
    } catch (error) {
      console.log(error);
      console.log(`Error connecting to database: ${JSON.stringify(error)}`);
    }
    return this.poolconnection.request();
  }

  async disconnect() {
    try {
      this.poolconnection.close();
      console.log('Database connection closed');
    } catch (error) {
      console.log(`Error closing database connection: ${error}`);
    }
  }


  //to be deleted
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

  // async readAll() {
  //   await this.connect();
  //   const request = this.poolconnection.request();
  //   const result = await request.query(`SELECT * FROM Person`);

  //   return result.recordsets[0];
  // }

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
}

async function createDbConnection(){
  return new Database(config);
}
// const dbConnection = new Database(config);

module.exports =  {createDbConnection};

