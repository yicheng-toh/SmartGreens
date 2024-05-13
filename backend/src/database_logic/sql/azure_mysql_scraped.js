const sql = require('mssql');

export default class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
    if (DEBUG) console.log(`Database: config: ${JSON.stringify(config)}`);
  }

  async connect() {
    try {
      if (DEBUG) console.log(`Database connecting...${this.connected}`);
      if (this.connected === false) {
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
        if (DEBUG) console.log('Database connection successful');
      } else {
        if (DEBUG) console.log('Database already connected');
      }
    } catch (error) {
      if (DEBUG) console.log(`Error connecting to database: ${JSON.stringify(error)}`);
    }
  }

  async disconnect() {
    try {
      this.poolconnection.close();
      if (DEBUG) console.log('Database connection closed');
    } catch (error) {
      if (DEBUG) console.log(`Error closing database connection: ${error}`);
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
}


module.exports = {
    Database,
}