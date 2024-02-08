const supertest = require('supertest');
const { app } = require('../../src/app.js');
// const mysql = require('mysql2/promise');
const {dbConnection} = require('../../src/database_logic/sql/mysql/mysql.js');


afterAll(async () => {
  // Close the MySQL connection after all tests are completed
  if (dbConnection) {
    await dbConnection.end();
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
});


describe("mockdata routes", () => {
    describe("route: '/mockdata/mockBarData'", () => {
      test("response status code 200", async() => {
          const response = await supertest(app).get("/mockdata/mockBarData");
          expect(response.status).toBe(200);
      })
    });

    describe("route: '/mockdata/mockDataContacts'", () => {
        test("response status code 200", async() => {
            const response = await supertest(app).get("/mockdata/mockDataContacts");
            expect(response.status).toBe(200);
        })
    });

    describe("route: '/mockdata/mockDataInvoices'", () => {
        test("response status code 200", async() => {
            const response = await supertest(app).get("/mockdata/mockDataInvoices");
            expect(response.status).toBe(200);
        })
    });

    describe("route: '/mockdata/mockDataTeam'", () => {
        test("response status code 200", async() => {
            const response = await supertest(app).get("/mockdata/mockDataTeam");
            expect(response.status).toBe(200);
        })
    });

    describe("route: '/mockdata/mockDataTeam'", () => {
        test("response status code 200", async() => {
            const response = await supertest(app).get("/mockdata/mockDataTeam");
            expect(response.status).toBe(200);
        })
    });

    describe("route: '/mockdata/mockGeographyData'", () => {
        test("response status code 200", async() => {
            const response = await supertest(app).get("/mockdata/mockGeographyData");
            expect(response.status).toBe(200);
        })
    });

    //Not implemented due to library error.
    // describe("route: '/mockdata/mockLineData'", () => {
    //     test("response status code 200", async() => {
    //         const response = await supertest(app).get("/mockdata/mockLineData");
    //         expect(response.status).toBe(200);
    //     })
    // });

    describe("route: '/mockdata/mockPieData'", () => {
        test("response status code 200", async() => {
            const response = await supertest(app).get("/mockdata/mockPieData");
            expect(response.status).toBe(200);
        })
    });

    describe("route: '/mockdata/mockTransactions'", () => {
        test("response status code 200", async() => {
            const response = await supertest(app).get("/mockdata/mockTransactions");
            expect(response.status).toBe(200);
        })
    });

})