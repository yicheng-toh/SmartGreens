// const mysql = require("mysql2");
// const mssql = require("mssql");
const {DEPLOYMENT, MYSQL, DOCKER} = require("../env.js");
let MSSQL = false;
// let dbDetails;

// if (DEPLOYMENT && !DOCKER){
//   dbDetails = require("../../yc_data.js");
// }else if (!DEPLOYMENT){
//   dbDetails = require("../../yc_data_test.js");
// }

if(MSSQL){
    const {dbConnection,
        insertSensorValues,
        getSensorDataByMicrocontrollerId,
        getAllSensorData,
        initialiseMySQL} = require("azure_mysql.js");

}else{
    const {dbConnection,
        insertSensorValues,
        getSensorDataByMicrocontrollerId,
        getAllSensorData,
        initialiseMySQL} = require("mysql.js");
}

module.exports = {
  dbConnection,
  insertSensorValues,
  getSensorDataByMicrocontrollerId,
  getAllSensorData,
  initialiseMySQL,
};


