const express = require("express");
const cors = require("cors");
const sqlite3 = require('sqlite3').verbose();
const {dbConnection, initialiseMySQL } = require("./database.js");
const {sendBadRequestResponse, sendInternalServerError} = require("./routes/request_error_messages.js")

const SQLITE = "SQLite";
const MYSQL = "MySQL";

const DEPLOYMENT = true; //False deployment refers to testing.
const DATABASE = SQLITE; //Either SQLITE or MYSQL
// const DATABASE = MYSQL; //Either SQLITE or MYSQL

let SQLITE_ROUTER_ROUTE;
let MYSQL_ROUTER_ROUTE;

if (!DEPLOYMENT){
  SQLITE_ROUTER_ROUTE = "/sqlite3";
  MYSQL_ROUTER_ROUTE = "/mysql";
  
}else{
  if (DATABASE == SQLITE){

    SQLITE_ROUTER_ROUTE = "";
    MYSQL_ROUTER_ROUTE = "/mysql";

  }else if (DATABASE == MYSQL){

    SQLITE_ROUTER_ROUTE = "/sqlite3";
    MYSQL_ROUTER_ROUTE = "";

  }else{
    console.log("Database not defined properly")
  }
}


const ROOT_ROUTE = "http://localhost"
const MOCKDATA_ROUTER_ROUTE = "/mockdata"

const app = express();
const port = 3000;

app.use(express.json());
//allow cors for local frontend and backend testing
app.use(cors({ origin: ROOT_ROUTE }));

//Instantiate Variables
mode = DATABASE

globallst = [];


app.get("/", async (req, res) => {
  try{
    //TODO is dbconnection is not required here, then delete the query and shift the import statement.
    const result = await dbConnection.promise().query(`SELECT * FROM BASESENSOR;`);
    console.log("/");
    console.log(result);    

    // Assuming globallst contains the data you want to send as JSON
    const jsonString = JSON.stringify(globallst);
    console.log("JSON String:", jsonString);
    res.status(200).json(result[0]);
  } catch (error) {
    sendInternalServerError(res);
  }

});

//Commented out due to clashing command in mysql routes.
/*
app.post("/", (req, res) => {
  console.log("Hello World");
  // Retrieve the data sent in the POST request
  const requestData = req.body;
  console.log("Received data:", requestData);
  globallst.push(requestData);
  try{
    dbConnection.promise().query(`INSERT INTO BASESENSOR VALUES('${requestData.temperature}','${requestData.humidity}')`);

  }catch(error){
    console.log("post / error");
    console.log(error);
  }
  // res.status(200).send("Data has been received." + JSON.stringify(requestData));
  res.status(200).send("Data has been received." );
});
*/

//This is a testing route. To be deleted after finalisation.
app.get("/allData", (req,res) => {
  res.status(200).send("All data has been sent." );
})


//Routes from other routers
//Mock Data routes
const mockDataRoute = require("./routes/mockDataRoute.js");
app.use(MOCKDATA_ROUTER_ROUTE, mockDataRoute);

//SQLite routes
const [SQlite3Route, intialiseSqlite3] = require("./routes/sqlite3_route.js");
app.use(SQLITE_ROUTER_ROUTE, SQlite3Route);

//MySQL routes
const MySQLRoute = require("./routes/mysql_route.js");
app.use( MYSQL_ROUTER_ROUTE, MySQLRoute);


//Initialises Database
console.log("Mode is " + mode);
if(mode == SQLITE){
  db = intialiseSqlite3();
}else if (mode == MYSQL) {
  initialiseMySQL() 
}else{
  console.log("Mode is unavailable. Please check your mode again.")
}


//Run Server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
