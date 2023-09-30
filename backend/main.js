// import { require } from "module";
// const require = createRequire(import.meta.url);
// import * as express from "express";
const express = require("express");
const cors = require("cors");
const db = require("./database.js")
// import cors from "cors";
// import mockDataRoute from "mockDataRoute.js";

const app = express();

const port = 3000;

app.use(express.json());
//allow cors for local frontend and backend testing
app.use(cors({ origin: "http://localhost" }));

globallst = [];


app.get("/", async (req, res) => {

    const result = await db.promise().query('SELECT * FROM BASESENSOR;');
    console.log("Database Result:", result.rows);
    console.log(result);
    console.log("gotten request");
    

    // Assuming globallst contains the data you want to send as JSON
    const jsonString = JSON.stringify(globallst);
    console.log("JSON String:", jsonString);

    res.status(200).json(globallst);
 
  console.log(globallst);
});

app.post("/", (req, res) => {
  console.log("Hello World");
  // Retrieve the data sent in the POST request
  const requestData = req.body;
  // Do something with the data (e.g., print it)
  console.log("Received data:", requestData);
  globallst.push(requestData);
  try{
    db.promise().query(`INSERT INTO BASESENSOR VALUES('${requestData.temperature}','${requestData.humidity}')`);

  }catch(e){
    console.log(e);
  }
  // res.status(200).send("Data has been received." + JSON.stringify(requestData));
  res.status(200).send("Data has been received." );
});

// import router from "./routes/mockDataRoute.js";
const mockDataRoute = require("./routes/mockDataRoute.js"); //from "mockDataRoute.js";
app.use("/mockdata", mockDataRoute);





//run the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
