const { json } = require("express");
const express = require("express");

const router = express.Router();

router.use(json());

router.post("/postTesting", (req, res) => {
    console.log("Hello World");
    // Retrieve the data sent in the POST request
    const requestData = req.body;
    // Do something with the data (e.g., print it)
    console.log("Received data:", requestData);
    globallst.push(requestData);
    try{
      dbConnection.promise().query(`INSERT INTO BASESENSOR VALUES('${requestData.temperature}','${requestData.humidity}')`);
  
    }catch(e){
      console.log(e);
    }
    // res.status(200).send("Data has been received." + JSON.stringify(requestData));
    res.status(200).send("Data has been received." );
  });


module.exports = router;