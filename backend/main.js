// const express = require("express");
// const cors = require("cors");
// const sqlite3 = require("sqlite3").verbose();
// // const {dbConnection, createTableIfNotExists} = require("./database.js")

// const app = express();

// const port = 3000;

// app.use(express.json());
// //allow cors for local frontend and backend testing
// app.use(cors({ origin: "http://localhost" }));

// //Instantiate Variables
// mode = "sqlite3";
// // mode = ""
// globallst = [];

// app.get("/", async (req, res) => {
//   res.status(200).send("hello world");
//   const result = await dbConnection
//     .promise()
//     .query(`SELECT * FROM BASESENSOR;`);
//   if (DEBUG) console.log("/");
//   if (DEBUG) console.log(result);

//   // Assuming globallst contains the data you want to send as JSON
//   const jsonString = JSON.stringify(globallst);
//   if (DEBUG) console.log("JSON String:", jsonString);
//   res.status(200).json(result[0]);
// });

// app.post("/", (req, res) => {
//   res.status(200).send("hello world post");
//   // if (DEBUG) console.log("Hello World");
//   // // Retrieve the data sent in the POST request
//   // const requestData = req.body;
//   // if (DEBUG) console.log("Received data:", requestData);
//   // globallst.push(requestData);
//   // try {
//   //   dbConnection
//   //     .promise()
//   //     .query(
//   //       `INSERT INTO BASESENSOR VALUES('${requestData.temperature}','${requestData.humidity}')`
//   //     );
//   // } catch (e) {
//   //   if (DEBUG) console.log("post / error");
//   //   if (DEBUG) console.log(e);
//   // }
//   // // res.status(200).send("Data has been received." + JSON.stringify(requestData));
//   // res.status(200).send("Data has been received.");
// });

// app.get("/allData", (req, res) => {
//   res.status(200).send("All data has been sent.");
// });

// // import router from "./routes/mockDataRoute.js";
// const mockDataRoute = require("./src/routes/mockDataRoute.js"); //from "mockDataRoute.js";
// app.use("/mockdata", mockDataRoute);
// const [SQlite3Route, intialiseSqlite3] = require("./routes/sqlite3_route.js");
// app.use("/sqlite3", SQlite3Route);
// // const MySQLRoute = require("./routes/mysql_route.js");
// // app.use("/mysql", MySQLRoute);
// // const {dbConnection, createTableIfNotExists} = require("./routes/mysql_route.js");

// if (DEBUG) console.log(mode);
// if (mode == "sqlite3") {
//   // intialiseSqlite3();
//   db = intialiseSqlite3();
// } else {
//   //Initialising Mysql
//   // dbConnection = dbConnection;
//   createTableIfNotExists();
//   // initialiseMySQL();
//   module.exports = dbConnection;
//   if (DEBUG) console.log("connected to sql server");
// }

// const ipAddress = "0.0.0.0";
// //run the server
// app.listen(port, ipAddress, () => {
//   if (DEBUG) console.log(`Server is listening at http://localhost:${port}`);
// });
