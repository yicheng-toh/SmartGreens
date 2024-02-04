const supertest = require('supertest');
// const app = require('../../../src/routes/mysql/plant_route.js'); // Replace with the actual path to your Express app file
const {app} = require('../../../src/app.js'); // Replace with the actual path to your Express app file
const mysqlLogic = require('../../../src/database_logic/sql/sql.js'); // Import your database logic module
//sql dbConnection
const {dbConnection} = require("../../../src/database_logic/sql/mysql/mysql.js");
const COMMON_ROUTE = '/mysql/calendar';

describe('Alert and Reminder Route Integration Tests', () => {
    beforeAll(async () => {
        // Perform any setup needed before running the tests (e.g., database seeding)
        //initialise all the tables
        await mysqlLogic.initialiseMySQL();
        //insert any initial data as necessary
      },100000);
    
    afterAll(async () => {
        // Perform any cleanup needed after running the tests
        //remove all tables.
        // const tablesToDrop = [
        //     'alert',
        //     'inventory',
        //     'microcontrollerplantbatchpair',
        //     'plantbatch',
        //     'plantinfo',
        //     'schedule',
        //     'sensorreadings',
        //     'task'
        //     ];

        // // connection.connect();

        // // Loop through the array of tables and drop each one
        // for (const tableName of tablesToDrop) {
        //     const dropTableQuery = `DROP TABLE IF EXISTS ${tableName}`;
        //     await new Promise((resolve, reject) => {
        //       dbConnection.query(dropTableQuery, (err) => {
        //         if (err) reject(err);
        //         else resolve();
        //       });
        //     });
        //   }
          await mysqlLogic.dropAllTableMySQL();
    // await dbConnection.disconnect();
    dbConnection.end();
    },100000);

  describe('POST /insertAlert', () => {
    it('should insert a new alert successfully', async () => {
      const response = await supertest(app)
        .post(COMMON_ROUTE + '/insertAlert')
        .send({
            issue: 'Check sensor readings',
            datetime: '2024-01-22T12:00:00',
            plantBatchId: 1, // Change this based on your data
            severity: 'high',
          });
        

      expect(response.status).toBe(201);
      // expect(response.text).toBe('Data inserted successfully');
    });

    it('should handle invalid data and return 500', async () => {
      const invalidTestData = [
        {  datetime: '2024-01-22T12:00:00', plantBatchId: 1, severity: 'high' },
        { issue: 'Check sensor readings',  plantBatchId: 1, severity: 'high' },
        { issue: 'Check sensor readings', datetime: '2024-01-22T12:00:00',  severity: 'high' },
        { issue: 'Check sensor readings', datetime: '2024-01-22T12:00:00', plantBatchId: 1 },
        { issue: ' ', datetime: '2024-01-22T12:00:00', plantBatchId: "1", severity: 'high' },
        { issue: '', datetime: '2024-01-22T12:00:00', plantBatchId: "1", severity: 'high' },
        // { issue: 'Check sensor readings', datetime: '2024-01-22T12:00:00', plantBatchId: 1, severity: 'high' },
        { issue: 'Check sensor readings', datetime: 'invalid', plantBatchId: 1, severity: 'high' },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + '/insertAlert')
          .send(testData);

        expect(response.status).toBe(500);
      }
    });

    // Add more tests as needed
  });

  describe('POST /insertSchedule', () => {
    it('should insert a new schedule successfully', async () => {
      const response = await supertest(app)
        .post(COMMON_ROUTE + '/insertSchedule')
        .send({
          task: 'Water the plants',
          datetime: '2024-01-22T14:00:00',
          status: '1'
        });

      expect(response.status).toBe(201);
      // expect(response.text).toBe('Data inserted successfully');
    });

    it('should handle invalid data and return 500', async () => {
      const invalidTestData = [
        {  datetime: '2024-01-22T14:00:00', status: '1' },
        { task: '',status: '1' },
        { task: '', datetime: '2024-01-22T14:00:00',  },
        { task: 'wash the apples', datetime: '2024-01-22T14:00:00', status: '' },
        { task: '', datetime: '2024-01-22T14:00:00', status: '1' },
        { task: 'Wash the apples', datetime: '2024-01-22T14:00:00', status: 'pending' },
        { task: 'Water the plants', datetime: 'invalid', status: '0' },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + '/insertSchedule')
          .send(testData);

        expect(response.status).toBe(500);
      }
    });

    // Add more tests as needed
  });

  describe('POST /insertTask', () => {
    it('should insert a new task successfully', async () => {
      const response = await supertest(app)
        .post(COMMON_ROUTE + '/insertTask')
        .send({
          action: 'Complete project tasks',
          datetime: '2024-01-22T16:00:00',
        //   status: false
          status: 0
        });

      expect(response.status).toBe(201);
      // expect(response.text).toBe('Data inserted successfully');
    });

    it('should handle invalid data and return 500', async () => {
      const invalidTestData = [
        { datetime: '2024-01-22T16:00:00', status: 1 },
        { action: 'ads',  status: '1' },
        { action: 'ads', datetime: '2024-01-22T16:00:00'},
        { action: '', datetime: '2024-01-22T16:00:00', status: 0 },
        { action: 'Complete project tasks', datetime: 'invalid', status: 0 },
        { action: 'Complete project tasks', datetime: '2024-01-22T16:00:00', status: 'pending' },
        // Add more invalid test cases as needed
      ];

      for (const testData of invalidTestData) {
        const response = await supertest(app)
          .post(COMMON_ROUTE + '/insertTask')
          .send(testData);

        expect(response.status).toBe(500);
      }
    });

    // Add more tests as needed
  });

  describe('GET /retrieveAlerts', () => {
    it('should retrieve all alerts successfully', async () => {
      const response = await supertest(app)
        .get(COMMON_ROUTE + '/retrieveAlerts');

      expect(response.status).toBe(200);
      // Add more assertions based on the expected response structure
    });

    // Add more tests as needed
  });

  describe('GET /retrieveReminders', () => {
    it('should retrieve all reminders successfully', async () => {
      const response = await supertest(app)
        .get(COMMON_ROUTE + '/retrieveReminders');

      expect(response.status).toBe(200);
      // Add more assertions based on the expected response structure
    });

    // Add more tests as needed
  });

  describe('GET /retrieveTasks', () => {
    it('should retrieve all tasks successfully', async () => {
      const response = await supertest(app)
        .get(COMMON_ROUTE + '/retrieveTasks');

      expect(response.status).toBe(200);
      // Add more assertions based on the expected response structure
    });

    // Add more tests as needed
  });

  describe('Unexpected Routes', () => {
    it('should return 404 for an unknown route', async () => {
      const response = await supertest(app)
        .get(COMMON_ROUTE + '/unknownRoute');

      expect(response.status).toBe(404);
    });
  });
});
