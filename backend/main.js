const express = require("express");
const cors = require('cors');

const app = express();

const port = 3000;

app.use(express.json());
//allow cors for local frontend and backend testing
app.use(cors({ origin: 'http://localhost' }));

//If there are too many links, use router to refactor them!

//Get request for '/' endpoint
app.get("/", (req, res) => {
  console.log("gotten request");
  res.status(200).send("Hello, World!");
});

app.post("/", (req, res) => {
  console.log("Hello World");
  // Retrieve the data sent in the POST request
  const requestData = req.body;
  // Do something with the data (e.g., print it)
  console.log("Received data:", requestData);
  res.status(200).send("Data has been received." + JSON.stringify(requestData));
});

//run the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
