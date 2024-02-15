const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const {
  sendBadRequestResponse,
  sendInternalServerError,
  sendPageNotFound,
} = require("./routes/request_error_messages.js");
const {
  DEPLOYMENT,
  DATABASE,
  NOT_LOGGING,
  DOCKER,
  DOCUMENTATION,
  DOCKER_AZURE,
} = require("./env.js");

const SQLITE = "SQLite";
const MYSQL = "MySQL";
const SQLITE_MYSQL = "both";
const MSSQL = process.env.MSSQL === "true" || false;

// const DEPLOYMENT = true; //False deployment refers to testing.
// const DEPLOYMENT = false; //False deployment refers to testing.
// const DATABASE = SQLITE; //Either SQLITE or MYSQL
// const DATABASE = MYSQL; //Either SQLITE or MYSQL
// const DATABASE = SQLITE_MYSQL;

let SQLITE_ROUTER_ROUTE;
let MYSQL_ROUTER_ROUTE;

if (!NOT_LOGGING) {
  console.log("Deployment: ", DEPLOYMENT);
  console.log("Database: ", DATABASE);
  console.log(`docker is ${DOCKER}`);
  console.log(`Documentation is ${DOCUMENTATION}`);
}

if (!DEPLOYMENT) {
  SQLITE_ROUTER_ROUTE = "/sqlite3";
  MYSQL_ROUTER_ROUTE = "/mysql";
} else {
  if (DATABASE == SQLITE) {
    SQLITE_ROUTER_ROUTE = "";
    MYSQL_ROUTER_ROUTE = "/mysql";
  } else if (DATABASE == MYSQL) {
    // const {
    //   dbConnection,
    //   initialiseMySQL,
    // } = require("./database_logic/sql/mysql/mysql.js");
    const {
      dbConnection,
      initialiseMySQL,
    } = require("./database_logic/sql/sql.js");
    SQLITE_ROUTER_ROUTE = "/sqlite3";
    MYSQL_ROUTER_ROUTE = "";
  } else if (DATABASE == SQLITE_MYSQL) {
    // const {
    //   dbConnection,
    //   initialiseMySQL,
    // } = require("./database_logic/sql/mysql/mysql.js");
    const { initialiseMySQL } = require("./database_logic/sql/sql.js");
    SQLITE_ROUTER_ROUTE = "/sqlite3";
    MYSQL_ROUTER_ROUTE = "/mysql";
  } else {
    console.log("Database not defined properly");
  }
}

const ROOT_ROUTE = "http://localhost";
const MOCKDATA_ROUTER_ROUTE = "/mockdata";

const app = express();

app.use(express.json());
//allow cors for local frontend and backend testing
// app.use(cors({ origin: ROOT_ROUTE }));

//Instantiate Variables
mode = DATABASE;

globallst = [];

app.get("/hello", async (req, res) => {
  try {
    //TODO is dbconnection is not required here, then delete the query and shift the import statement.
    // const result = await dbConnection
    //   .promise()
    //   .query(`SELECT * FROM BASESENSOR;`);
    // console.log("/");
    // console.log(result);

    // // Assuming globallst contains the data you want to send as JSON
    // const jsonString = JSON.stringify(globallst);
    // console.log("JSON String:", jsonString);
    // res.status(200).json(result[0]);
    res.status(200).send("The express server is working");
  } catch (error) {
    sendInternalServerError(res);
  }
});

app.get("/docker", async (req, res) => {
  try {
    res.status(200).json({ message: "Docker success" });
  } catch (error) {
    sendInternalServerError(res);
  }
});

app.get("/", async (req, res) => {
  try {
    res.status(200).json({ message: "homepage" });
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
app.get("/allData", (req, res) => {
  try {
    res.status(200).send("All data has been sent.");
  } catch (error) {
    sendInternalServerError(res);
  }
});

//Routes from other routers
//Mock Data routes
const mockDataRoute = require("./routes/mockDataRoute.js");
app.use(MOCKDATA_ROUTER_ROUTE, mockDataRoute);

//SQLite routes
if (mode == SQLITE || mode == SQLITE_MYSQL) {
  try {
    const {
      SQlite3Route,
      db,
      initialiseSqlite3,
    } = require("./routes/sqlite3_route.js");
    // const {} = require("./database_logic/sqlite.js");
    app.use(SQLITE_ROUTER_ROUTE, SQlite3Route);
    initialiseSqlite3(db);
  } catch (error) {
    console.log("error initialising sqlite database");
    console.log(error);
  }
}

//MySQL routes
if (mode == MYSQL || mode == SQLITE_MYSQL) {
  if (!NOT_LOGGING) {
    console.log("MSSQL is", MSSQL);
  }

  try {
    const MySQLRoute = require("./routes/mysql/mysql_route.js");
    app.use(MYSQL_ROUTER_ROUTE, MySQLRoute);
    if (MSSQL) {
      // dbConnection.initialiseMySQL()
      initialiseMySQL();
    } else {
      initialiseMySQL();
    }
  } catch (error) {
    console.log("Currently encountering error initalising MYSQL database");
    console.log(error);
  }
}

if (DOCUMENTATION) {
  const swaggerJSDoc = require("swagger-jsdoc");
  const swaggerUi = require("swagger-ui-express");
  // Swagger setup
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "Express Swagger Example",
      version: "1.0.0",
      description: "A simple Express Swagger example",
    },
    basePath: "/",
  };
  let options;
  if (!DOCKER_AZURE) {
    options = {
      swaggerDefinition,
      apis: ["./src/routes/mysql/*.js", "./src/app.js"], // Path to the API routes
    };
  } else {
    options = {
      swaggerDefinition,
      apis: ["./routes/mysql/*.js", "./app.js"], // Do this before launching to docker.
    };
  }

  const swaggerSpec = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use((req, res) => {
  sendPageNotFound(res);
});

module.exports = { app };
//Run Server
// try{
//   app.listen(port, () => {
//     console.log(`Server is listening at http://localhost:${port}`);
//   });
// } catch (error){
//   console.log("Unable to start up the app");
//   console.log(error);
// }
