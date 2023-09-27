// import { require } from "module";
// const require = createRequire(import.meta.url);
// import * as express from "express";
const express = require("express");
const cors = require("cors");
// import cors from "cors";
// import mockDataRoute from "mockDataRoute.js";

const app = express();

const port = 3000;

app.use(express.json());
//allow cors for local frontend and backend testing
app.use(cors({ origin: "http://localhost" }));

globallst = [];

//Get request for '/' endpoint
app.get("/", (req, res) => {
  console.log("gotten request");
  // res.status(200).send("Hello, World!");
  console.log(globallst);
  res.status(200).send(JSON.stringify(globallst));
});

app.post("/", (req, res) => {
  console.log("Hello World");
  // Retrieve the data sent in the POST request
  const requestData = req.body;
  // Do something with the data (e.g., print it)
  console.log("Received data:", requestData);
  globallst.push(requestData);
  res.status(200).send("Data has been received." + JSON.stringify(requestData));
});

// import router from "./routes/mockDataRoute.js";
const mockDataRoute = require("./routes/mockDataRoute.js"); //from "mockDataRoute.js";
app.use("/mockdata", mockDataRoute);

//run the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
