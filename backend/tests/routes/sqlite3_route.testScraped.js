// const supertest = require('supertest');
// const { app } = require('../../src/app.js');
// const {dbConnection} = require('../../src/database_logic/mysql.js');

// afterAll(async () => {
//     // Close the MySQL connection after all tests are completed
//     if (dbConnection) {
//       await dbConnection.end();
//     }
//     await new Promise((resolve) => setTimeout(resolve, 500));
//   });

// //Edit the contents of the sqlite database for testing purposes.
// //Make sure you can restart to the same state after testing.
// describe("mysql routes", () => {
//     describe("route: '/sqlite3/retrieveData'", () => {
//       test("response status code 200", async() => {
//           const response = await supertest(app).get("/sqlite3/retrieveData");
//           expect(response.status).toBe(200);
//       })
//     });

//     describe("route: '/sqlite3/retrieveData/1'", () => {
//       test("response status code 200 and correct message", async() => {
//           const response = await supertest(app).get("/sqlite3/retrieveData/1");
//           expect(response.status).toBe(200);
//       })
//     });
//     //TODO test post request if a new database is created
//     // describe("route: '/invalidRoute'", () => {
//     //   test("a should be the same as b", async() => {
//     //       const response = await supertest(app).get("/invalidRoute");
//     //       expect(response.status).toBe(404);
//     //   })
//     // });
// })