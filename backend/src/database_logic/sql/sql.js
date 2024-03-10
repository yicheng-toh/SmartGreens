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
// console.log(`mssql is ${MSSQL}`);
let dbConnection,insertSensorValues,getSensorDataByMicrocontrollerId,getAllSensorData,initialiseMySQL, dropAllTableMySQL;
if(MSSQL){
// if(false){
    // ({dbConnection,
    //     insertSensorValues,
    //     getSensorDataByMicrocontrollerId,
    //     getAllSensorData,
    //     initialiseMySQL} = require("./azure_mysql.js"));
    // (dbConnection = require("./azure_mysql.js"));
    // ({insertSensorValues,getSensorDataByMicrocontrollerId,getAllSensorData,initialiseMySQL} = dbConnection);
    // // initialiseMySQL = dbConnection.initialiseMySQL;
    // console.log(initialiseMySQL);
    // module.exports = dbConnection;
    // ({dbConnection} = require("./mssql/mssql.js"));
    ({createDbConnection} = require("./mssql/mssql.js"));
    ({initialiseMySQL, dropAllTableMySQL} = require("./mssql/initialise_mssql.js"));
    const plantLogic = require("./mssql/plant_mssql.js");
    const initialisationLogic = require("./mssql/initialise_mssql.js");
    const sensorLogic = require("./mssql/sensor_mssql.js");
    const calendarLogic = require("./mssql/calendar_mssql.js");
    const inventoryLogic = require("./mssql/inventory_mssql.js");
    const energyConsumptionLogic = require("./mssql/energy_consumption_mssql.js");
    module.exports = {
      dbConnection,
      insertSensorValues,
      getSensorDataByMicrocontrollerId,
      getAllSensorData,
      initialiseMySQL,
      dropAllTableMySQL,
      ...plantLogic,
      ...initialisationLogic,
      ...sensorLogic,
      ...calendarLogic,
      ...inventoryLogic,
      ...energyConsumptionLogic,
    };
}else{
  //import dbConnection from one file and then funtions from another file.
    ({dbConnection} = require("./mysql/mysql.js"));
    ({initialiseMySQL,dropAllTableMySQL} = require("./mssql/initialise_mssql.js"));
    const plantLogic = require("./mysql/plant_mysql.js");
    const initialisationLogic = require("./mysql/initialise_mysql.js");
    const sensorLogic = require("./mysql/sensor_mysql.js");
    const calendarLogic = require("./mysql/calendar_mysql.js");
    const inventoryLogic = require("./mysql/inventory_mysql.js");
    const energyConsumptionLogic = require("./mysql/energy_consumption_mysql.js");
    module.exports = {
      dbConnection,
      insertSensorValues,
      getSensorDataByMicrocontrollerId,
      getAllSensorData,
      initialiseMySQL,
      dropAllTableMySQL,
      ...plantLogic,
      ...initialisationLogic,
      ...sensorLogic,
      ...calendarLogic,
      ...inventoryLogic,
      ...energyConsumptionLogic,
    };
}




