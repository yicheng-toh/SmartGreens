const supertest = require("supertest");
// const app = require('../../../src/routes/mysql/plant_route.js'); // Replace with the actual path to your Express app file
const { app } = require("../../../src/app.js"); // Replace with the actual path to your Express app file
const mysqlLogic = require("../../../src/database_logic/sql/sql.js"); // Import your database logic module
//sql dbConnection
const {
  dbConnection,
} = require("../../../src/database_logic/sql/mysql/mysql.js");

const COMMON_ROUTE = "/mysql/plant";

describe("Plant Route Integration Tests", () => {
  beforeAll(async () => {
    // Perform any setup needed before running the tests (e.g., database seeding)
    //initialise all the tables
    
    // console.log("trying to inser new plant");
    // mysqlLogic.initialiseMySQL();
    // mysqlLogic.insertNewPlant("Tomapo", 20,90);
    // mysqlLogic.insertNewPlant("Tomaco", 20,90);
    // mysqlLogic.updatePlantSeedInventory(1,1000);
    await mysqlLogic.initialiseMySQL();
    await mysqlLogic.insertNewPlant("Tomapo", 20,90);
    await mysqlLogic.insertNewPlant("Tomaco", 20,90);
    await mysqlLogic.updatePlantSeedInventory(1,1000);
    // console.log("insertion supposed to be completed")
    // console.log("trying to change the plant seed quantity");
    
    // console.log("quantity change is supposed to be completed.");
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
    // await dbConnection.disconnect();
    dbConnection.end();
  },100000);

  describe("POST /insertData/:microcontrollerId", () => {
    it("should insert sensor data successfully", async () => {
      const response = await supertest(app)
        .post(COMMON_ROUTE + "/insertData/A1")
        .send({
          temperature: 25.5,
          humidity: 60,
          brightness: 500,
        });

      expect(response.status).toBe(201);
      // expect(response.text).toBe("Data inserted successfully");
    },10000);

    it("should handle invalid data and return 500", async () => {
      const invalidTestData = [
        { humidity: 60, brightness: 500 },
        { temperature: 25.5, brightness: 500 },
        { temperature: 25.5, humidity: 60 },
        { temperature: 25.5, humidity: "invalid", brightness: 500 },
        { temperature: 25.5, humidity: 60, brightness: "invalid" },
        { temperature: "invalid", humidity: 60, brightness: 500 },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/insertData/A1") // Replace 1 with an actual microcontrollerId
          .send(testData);

        expect(response.status).toBe(500);
      }
    },10000);

    it("should handle invalid microcontroller id and return 400", async () => {
      const response = await supertest(app)
        .post(COMMON_ROUTE + "/insertData/invalidMicrocontrollerId") // Replace 1 with an actual microcontrollerId
        .send({
          temperature: -25.5,
          humidity: -60,
          brightness: -500,
        });
      expect(response.status).toBe(400);
    },10000);

    // Add more tests as needed
  });

  describe("POST /plant/createPlant", () => {
    it("should create a new plant successfully", async () => {
      const response = await supertest(app)
        .post(COMMON_ROUTE + "/createPlant")
        .send({
          plantName: "Tomato",
          sensorRanges: 0,
          daysToMature: 90,
        });

      expect(response.status).toBe(201);
      // expect(response.text).toBe("Data inserted successfully");
    },10000);

    it("should handle undefined data and return 500", async () => {
      const invalidTestData = [
        { sensorRanges: 0, daysToMature: 90 },
        { plantName: "Tomato x", daysToMature: 90 },
        { plantName: "Tomato x", sensorRanges: 1 },
        // { plantName: "Tomato x", sensorRanges: 1, daysToMature: 90 },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/createPlant")
          .send(testData);

        expect(response.status).toBe(500);
      }
    },10000);
    it("should handle invalid data and return 500", async () => {
      const invalidTestData = [
        {
          plantName: "Tomato x",
          sensorRanges: "Optimal ranges",
          daysToMature: 90,
        },
        { plantName: "", sensorRanges: 1, daysToMature: 90 },
        { plantName: "Tomato x", sensorRanges: 1, daysToMature: "invalid" },
        // { plantName: "Tomato x", sensorRanges: 1, daysToMature: 90 },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/createPlant")
          .send(testData);

        expect(response.status).toBe(500);
      }
    },10000);

    // Add more tests as needed
  });

  describe("POST /plant/editSeedQuantity", () => {
    it("should edit seed quantity successfully", async () => {
      const response = await supertest(app)
        .post(COMMON_ROUTE + "/editSeedQuantity")
        .send({
          //You may want this to be a put request instead.
          plantId: 1, // Replace 1 with an actual plantId
          quantityChange: 1000,
        });

      expect(response.status).toBe(201);
      // expect(response.text).toBe("Data inserted successfully");
    },10000);

    it("should handle invalid data and return 500", async () => {
      const invalidTestData = [
        { quantityChange: 10 },
        { plantId: "20" },
        { plantId: "invalid", quantityChange: 10 },
        { plantId: "20", quantityChange: "invalid" },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/editSeedQuantity")
          .send(testData);

        expect(response.status).toBe(500);
      }
    },10000);

    // Add more tests as needed
  });

  describe("POST /growPlant", () => {
    it("should grow plants successfully", async () => {
      const response = await supertest(app)
        .post(COMMON_ROUTE + "/growPlant")
        .send({
          plantId: 1,
          plantLocation: 2,
          microcontrollerId: 1234,
          quantityPlanted: 5,
          datePlanted: "2024-01-22",
        });

      expect(response.status).toBe(201);
      // expect(response.text).toBe("Data inserted successfully");
    },50000);

    it("should handle undefined data and return 500", async () => {
      const invalidTestData = [
        // Missing required fields
        {
          plantLocation: 2,
          microcontrollerId: 123,
          quantityPlanted: 5,
          datePlanted: "2024-01-22",
        },
        {
          plantId: 1,
          microcontrollerId: 123,
          quantityPlanted: 5,
          datePlanted: "2024-01-22",
        },
        {
          plantId: 1,
          plantLocation: 2,
          quantityPlanted: 5,
          datePlanted: "2024-01-22",
        },
        {
          plantId: 1,
          plantLocation: 2,
          microcontrollerId: 123,
          datePlanted: "2024-01-22",
        },
        {
          plantId: "Invalid Id",
          plantLocation: 2,
          microcontrollerId: 123,
          quantityPlanted: 5,
        },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/growPlant")
          .send(testData);

        expect(response.status).toBe(500);
      }
    },50000);

    it("should handle invalid data and return 500", async () => {
      const invalidTestData = [
        // Invalid data types
        {
          plantId: "Invalid Id",
          plantLocation: 2,
          microcontrollerId: 123,
          quantityPlanted: 5,
          datePlanted: "2024-01-22",
        },
        {
          plantId: 1,
          plantLocation: 2,
          microcontrollerId: "Invalid",
          quantityPlanted: 5,
          datePlanted: "2024-01-22",
        },
        {
          plantId: 1,
          plantLocation: 2,
          microcontrollerId: 123,
          quantityPlanted: "Invalid",
          datePlanted: "2024-01-22",
        },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/growPlant")
          .send(testData);

        expect(response.status).toBe(500);
      }
    },50000);

    it("should handle extreme data values and return 500", async () => {
      const invalidTestData = [
       
        // // Out-of-range values
        {
          plantId: 100000000,//failed as no data is being queried... need to catch this
          plantLocation: 2,
          microcontrollerId: 123,
          quantityPlanted: 5,
          datePlanted: "2024-01-22",
        },
        {
          plantId: 1,
          plantLocation: 2,
          microcontrollerId: 123,
          quantityPlanted: -1000,
          datePlanted: "2024-01-22",
        },
        {
          plantId: 1,
          plantLocation: 2,
          microcontrollerId: 123,
          quantityPlanted: 50000000,//Cannot exceed int value. if want exceed, use big int.... error not caught.
          datePlanted: "2024-01-22",
        },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + "/growPlant")
          .send(testData);

        expect(response.status).toBe(500);
      }
    },50000);
  });

    describe("POST /plant/harvestPlant", () => {
      it("should harvest plants successfully", async () => {
        const response = await supertest(app).post(COMMON_ROUTE + "/harvestPlant").send({
          plantBatchId: 1, // Replace 1 with an actual plantBatch
          quantityHarvested: 3,
        });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(1);
      },10000);

      it("should handle undefined data and return 500", async () => {
        const invalidTestData = [
          { quantityHarvested: 3 },
          { plantBatchId: 1 },
          // Add more invalid test cases as needed
        ];

        for (const testData of invalidTestData) {
          const response = await supertest(app)
            .post(COMMON_ROUTE + "/harvestPlant")
            .send(testData);

          expect(response.status).toBe(500);
        }
      });
      it("should handle invalid data and return 500", async () => {
        const invalidTestData = [
          { plantBatchId: "invalid", quantityHarvested: 3 },
          { plantBatchId: 1, quantityHarvested: "invalid" },
          { plantBatchId: 1, quantityHarvested: 1000000 },
          // Add more invalid test cases as needed
        ];

        for (const testData of invalidTestData) {
          const response = await supertest(app)
            .post(COMMON_ROUTE + "/harvestPlant")
            .send(testData);

          expect(response.status).toBe(500);
        }
      },15000);

    //   Add more tests as needed
    });

    describe("GET /plant/retrieveData", () => {
      it("should retrieve sensor data successfully", async () => {
        const response = await supertest(app).get(COMMON_ROUTE + "/retrieveData");

        expect(response.status).toBe(200);
        // Add more assertions based on the expected response structure
      });

      // Add more tests as needed
    },10000);

    describe("GET /plantSeedsInventory", () => {
      it("should retrieve plant seeds inventory successfully", async () => {
        const response = await supertest(app).get(COMMON_ROUTE + "/plantSeedsInventory");

        expect(response.status).toBe(200);
        // Add more assertions based on the expected response structure
      },20000);

      // Add more tests as needed
    },30000);

    describe("GET /plant/plantData", () => {
      it("should retrieve plant data successfully", async () => {
        const response = await supertest(app).get(COMMON_ROUTE + "/plantData");

        expect(response.status).toBe(200);
        // Add more assertions based on the expected response structure
      },100000);

      // Add more tests as needed
    },10000);

    describe("GET /plant/plantBatchInfoAndYield", () => {
      it("should retrieve plant batch info and yield successfully", async () => {
        const response = await supertest(app).get(COMMON_ROUTE + "/plantBatchInfoAndYield");

        expect(response.status).toBe(200);
        // Add more assertions based on the expected response structure
      },10000);

      // Add more tests as needed
    },10000);

    describe("GET /plant/plantYield", () => {
      it("should retrieve plant data successfully", async () => {
        const response = await supertest(app).get(COMMON_ROUTE + "/plantYield");

        expect(response.status).toBe(200);
        // Add more assertions based on the expected response structure
      });

      // Add more tests as needed
    },10000);

    // Add tests for other routes as needed

    describe("Unexpected Routes", () => {
      it("should return 404 for an unknown route", async () => {
        const response = await supertest(app).get(COMMON_ROUTE + "/unknownRoute");

        expect(response.status).toBe(404);
      });
    },10000);
});
