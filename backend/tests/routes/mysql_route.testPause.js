const supertest = require('supertest');
const { app } = require('../../src/app.js');
// const mysql = require('mysql2/promise');
const {dbConnection} = require('../../src/database_logic/sql/mysql/mysql.js');

//TODO to create a separate test database for mysql testing.
afterAll(async () => {
  // Close the MySQL connection after all tests are completed
  if (dbConnection) {
    await dbConnection.end();
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
});
// afterAll(async () => {
//   await new Promise(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
// });

describe("mysql routes", () => {
    describe("route: '/mysql/retrieveData'", () => {
      test("response status code 200", async() => {
          const response = await supertest(app).get("/mysql/retrieveData");
          expect(response.status).toBe(200);
      })
    });

    // describe("route: '/mysql/retrieveData/1'", () => {
    //   test("response status code 200 and correct message", async() => {
    //       const response = await supertest(app).get("/mysql/retrieveData/1");
    //       expect(response.status).toBe(200);
    //   })
    // });
    //TODO test post request if a new database is created
    // describe("route: '/invalidRoute'", () => {
    //   test("a should be the same as b", async() => {
    //       const response = await supertest(app).get("/invalidRoute");
    //       expect(response.status).toBe(404);
    //   })
    // });
})