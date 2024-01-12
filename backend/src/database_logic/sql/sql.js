// const mysql = require("mysql2");
// const mssql = require("mssql");
const {DEPLOYMENT, MYSQL, DOCKER, MSSQL} = require("../../env.js");
// let MSSQL = false;
// let dbDetails;

// if (DEPLOYMENT && !DOCKER){
//   dbDetails = require("../../yc_data.js");
// }else if (!DEPLOYMENT){
//   dbDetails = require("../../yc_data_test.js");
// }
console.log(`mssql is ${MSSQL}`);
let dbConnection,insertSensorValues,getSensorDataByMicrocontrollerId,getAllSensorData,initialiseMySQL;
if(MSSQL){
    // ({dbConnection,
    //     insertSensorValues,
    //     getSensorDataByMicrocontrollerId,
    //     getAllSensorData,
    //     initialiseMySQL} = require("./azure_mysql.js"));
    (dbConnection = require("./azure_mysql.js"));
    ({insertSensorValues,getSensorDataByMicrocontrollerId,getAllSensorData,initialiseMySQL} = dbConnection);
    // initialiseMySQL = dbConnection.initialiseMySQL;
    console.log(initialiseMySQL);
    module.exports = dbConnection;



}else{
  //import dbConnection from one file and then funtions from another file.
    ({dbConnection} = require("./mysql.js"));
    const plantLogic = require("./mysql/plant_mysql.js");
    const miscLogic = require("./mysql/misc_mysql.js");
    module.exports = {
      dbConnection,
      insertSensorValues,
      getSensorDataByMicrocontrollerId,
      getAllSensorData,
      initialiseMySQL,
      ...plantLogic,
      ...miscLogic,
    };
}




