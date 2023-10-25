// import { require } from "module";
// const require = createRequire(import.meta.url);
// import * as express from "express";
const express = require("express");
const cors = require("cors");
const sqlite3 = require('sqlite3').verbose();
const {dbConnection, createTableIfNotExists} = require("./database.js")

// import cors from "cors";
// import mockDataRoute from "mockDataRoute.js";

const app = express();

const port = 3000;

app.use(express.json());
//allow cors for local frontend and backend testing
app.use(cors({ origin: "http://localhost" }));

const db = new sqlite3.Database('mydatabase.db', sqlite3.OPEN_READWRITE,(err) => {
  if (err) {
    console.error('Error connecting to the SQLite database:', err);
  } else {
    console.log('Connected to the SQLite database');
  }
});

module.exports = db;
mode = "sqlite3"

globallst = [];


app.get("/", async (req, res) => {

    const result = await dbConnection.promise().query(`SELECT * FROM BASESENSOR;`);
    // console.log("Database Result:", result.rows);
    console.log("/");
    console.log(result);
    // console.log("gotten request");
    

    // Assuming globallst contains the data you want to send as JSON
    const jsonString = JSON.stringify(globallst);
    console.log("JSON String:", jsonString);

    res.status(200).json(result[0]);
 
  // console.log(globallst);
});

app.post("/", (req, res) => {
  console.log("Hello World");
  // Retrieve the data sent in the POST request
  const requestData = req.body;
  // Do something with the data (e.g., print it)
  console.log("Received data:", requestData);
  globallst.push(requestData);
  try{
    dbConnection.promise().query(`INSERT INTO BASESENSOR VALUES('${requestData.temperature}','${requestData.humidity}')`);

  }catch(e){
    console.log("post / error");
    console.log(e);
  }
  // res.status(200).send("Data has been received." + JSON.stringify(requestData));
  res.status(200).send("Data has been received." );
});

app.get("/allData", (req,res) => {
  
  res.status(200).send("All data has been sent." );
})

// import router from "./routes/mockDataRoute.js";
const mockDataRoute = require("./routes/mockDataRoute.js"); //from "mockDataRoute.js";
app.use("/mockdata", mockDataRoute);
const [SQlite3Route, intialiseSqlite3] = require("./routes/sqlite3_route.js");
app.use("/sqlite3", SQlite3Route);

console.log(mode);
if(mode == "sqlite3"){
  // intialiseSqlite3();
  console.log("initialising table");
  db.run(`
        CREATE TABLE IF NOT EXISTS SensorDetail (
        dateTime DATETIME,
        microcontrollerId INT,
        plantBatch INT,
        temperature FLOAT,
        humidity INT,
        brightness INT
        )
        `);
}

//Initialising
// createTableIfNotExists()

//run the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
