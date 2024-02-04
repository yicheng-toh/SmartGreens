const supertest = require("supertest");
// const app = require('../../../src/routes/mysql/plant_route.js'); // Replace with the actual path to your Express app file
const { app } = require("../../../src/app.js"); // Replace with the actual path to your Express app file
const mysqlLogic = require("../../../src/database_logic/sql/sql.js"); // Import your database logic module
//sql dbConnection
const {
  dbConnection,
} = require("../../../src/database_logic/sql/mysql/mysql.js");
const {MSSQL} = require("../../../src/env.js")
const COMMON_ROUTE = '/mysql/inventory';

describe("Inventory Route Integration Tests", () => {
  beforeAll(async () => {
    // Perform any setup needed before running the tests (e.g., database seeding)
    //initialise all the tables
    // if(MSSQL){
    //   const dbConnection = await createDbConnection();
    // }else{
    //   dbConnection.connect();
    // }
    
    // await mysqlLogic.initialiseMySQL();
    // await mysqlLogic.initialiseMySQL();
    // await mysqlLogic.insertNewInventoryObject("HCL", 10, "litres", 1);
    // await mysqlLogic.insertNewInventoryObject("HCL2", 30, "litres", 1);
    mysqlLogic.initialiseMySQL();
    mysqlLogic.initialiseMySQL();
    await mysqlLogic.initialiseMySQL();
    await mysqlLogic.insertNewInventoryObject("HCL", 10, "litres", 1);
    await mysqlLogic.insertNewInventoryObject("HCL2", 30, "litres", 1);
    //insert any initial data as necessary
  },100000);

  afterAll(async () => {
    // Perform any cleanup needed after running the tests
    //remove all tables.
    // const tablesToDrop = [
    //   "alert",
    //   "inventory",
    //   "microcontrollerplantbatchpair",
    //   "plantbatch",
    //   "plantinfo",
    //   "schedule",
    //   "sensorreadings",
    //   "task",
    // ];

    // // connection.connect();

    // // Loop through the array of tables and drop each one
    // for (const tableName of tablesToDrop) {
    //   const dropTableQuery = `DROP TABLE IF EXISTS ${tableName}`;
    //   await new Promise((resolve, reject) => {
    //     dbConnection.query(dropTableQuery, (err) => {
    //       if (err) reject(err);
    //       else resolve();
    //     });
    //   });
    // }
    await mysqlLogic.dropAllTableMySQL();
    // mysqlLogic.dropAllTableMySQL();
    dbConnection.end();
    // await dbConnection.disconnect();
    // connection.end();
  },100000);

  describe("POST /insertNewInventory", () => {
    it("should insert new inventory successfully", async () => {
      const response = await supertest(app).post( COMMON_ROUTE + "/insertNewInventory").send({
        inventoryName: "Acidic Solutiona",
        quantity: 50,
        units: "liters",
        location: 3,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(1);
    }, 10000);

    it("should handle undefined data and return 500", async () => {
      const invalidTestData = [
        {  quantity: 50, units: "liters" },
        { inventoryName: "", units: "liters" },
        { inventoryName: "", quantity: 50},
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/insertNewInventory")
          .send(testData);

        expect(response.status).toBe(500);
      }
    }, 10000);
    it("should handle invalid data and return 500", async () => {
      const invalidTestData = [
        { inventoryName: "", quantity: 50, units: "liters" },
        {
          inventoryName: "Acidic Solution",
          quantity: "invalid",
          units: "liters",
        },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/insertNewInventory")
          .send(testData);

        expect(response.status).toBe(500);
      }
    }, 10000);

    // Add more tests as needed
  });

  describe("POST /updateInventoryQuantity", () => {
    it("should update inventory quantity successfully", async () => {
      // Implement a mechanism to get the initial inventory quantity before the test

      const response = await supertest(app)
        .post(COMMON_ROUTE + "/updateInventoryQuantity")
        .send({
          currentInventoryId: 1,
          quantityChange: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(1);

      // Implement assertions to verify that the inventory quantity has been updated
    }, 10000);

    it("should handle undefined data and return 500", async () => {
      const invalidTestData = [
        {  quantityChange: 10 },
        { currentInventoryId: "" },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/updateInventoryQuantity")
          .send(testData);

        expect(response.status).toBe(500);
      }
    }, 10000);
    it("should handle invalid data and return 500", async () => {
      const invalidTestData = [
        { currentInventoryId: "", quantityChange: 10 },
        { currentInventoryId: "invalid", quantityChange: "" },
        { currentInventoryId: "invalid", quantityChange: 10 },
        { currentInventoryId: 1, quantityChange: "invalid" },
        { currentInventoryId: 1, quantityChange: -1000000000000000000 },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/updateInventoryQuantity")
          .send(testData);

        expect(response.status).toBe(500);
      }
    }, 30000);


    // Add more tests as needed
  });

  describe("POST /updateInventoryUnit", () => {
    it("should update inventory unit successfully", async () => {
      const response = await supertest(app).post(COMMON_ROUTE + "/updateInventoryUnit").send({
        currentInventoryId: 1,
        newUnit: "gallons",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(1);
    }, 10000);

    it("should handle invalid data and return 500", async () => {
      const invalidTestData = [
        { currentInventoryId: "invalid", newUnit: "gallons" },
        // { currentInventoryId: 1, newUnit: "" },//This is valid
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/updateInventoryUnit")
          .send(testData);

        expect(response.status).toBe(500);
      }
    }, 10000);

    // Add more tests as needed
  });

  describe("GET /retrieveAllInventoryData", () => {
    it("should retrieve all inventory data successfully", async () => {
      const response = await supertest(app).get(COMMON_ROUTE + "/retrieveAllInventoryData");

      expect(response.status).toBe(200);
      // Add more assertions based on the expected response structure
    }, 10000);

    // Add more tests as needed
  });

  describe("DELETE /deleteInventory/:currentInventoryId", () => {
    it("should delete inventory successfully", async () => {
      //Add dummy data
      
      // Implement a mechanism to get the initial count of inventory objects before the test

      const response = await supertest(app).delete(COMMON_ROUTE + "/deleteInventory/2");

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(1);

      // Implement assertions to verify that the inventory object has been deleted
    },10000);

    it("should handle invalid data and return 500", async () => {
      const invalidTestData = [
        { currentInventoryId: "invalid" },
        { currentInventoryId: 200 },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app).delete(
          COMMON_ROUTE + "/deleteInventory/" + testData.currentInventoryId
        );
        expect(response.status).toBe(500);
      }
    }, 10000);

    // Add more tests as needed
  });

  describe("Unexpected Routes", () => {
    it("should return 404 for an unknown route", async () => {
      const response = await supertest(app).get(COMMON_ROUTE + "/unknownRoute");

      expect(response.status).toBe(404);
    }, 10000);
  });
});
