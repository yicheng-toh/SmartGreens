const mysql = require("mysql2");
// const mssql = require("mssql");
const {DEPLOYMENT, MYSQL, DOCKER, MSSQL} = require("../../../env.js");
const fs = require('fs');
// import modular sql function.


// let MSSQL = false;
let dbDetails;

if (DEPLOYMENT && !DOCKER){
  dbDetails = require("../../../../yc_data.js");
}else if (!DEPLOYMENT){
  dbDetails = require("../../../../yc_data_test.js");
}


let dbConnection;
if (DOCKER){
  dbConnection = mysql.createConnection({
  host: MYSQL.HOST,
  user: MYSQL.USER,
  password: MYSQL.PASSWORD,
  database: MYSQL.DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Adjust according to your needs
  queueLimit: 0,
  });
// } else if (MSSQL) {
//     dbConnection = new mssql.ConnectionPool({
//     host: MYSQL.HOST,
//     user: MYSQL.USER,
//     password: MYSQL.PASSWORD,
//     database: MYSQL.DATABASE,
//     waitForConnections: true,
//     connectionLimit: 10, // Adjust according to your needs
//     queueLimit: 0,
//     });
//     request = dbConnection.request();
// }else if (MSSQL){
//   console.log("executing a very important mssql init data");
//   dbConnection = mysql.createConnection({
//     host: MYSQL.HOST,
//     user: MYSQL.USER,
//     password: MYSQL.PASSWORD,
//     database: MYSQL.DATABASE,
//     waitForConnections: true,
//     connectionLimit: 10, // Adjust according to your needs
//     queueLimit: 0,
//     // ssl: {ca: fs.readFileSync("../../../DigiCertGlobalRootCA.crt.pem")},
//     ssl: {ca: fs.readFileSync("./DigiCertGlobalRootCA.crt.pem")},
//     authentication: {
//       type: 'default'
//     },
//     options: {
//       encrypt: true
//   }
//     });

//     dbConnection.connect((err) => {
//       if (err) {
//         console.log('Error connecting to local MySQL database:', err);
//         return;
//       }
//       console.log('Connected to local MySQL database');
//     });

} else {
  dbConnection = mysql.createConnection({
  host: dbDetails.host,
  user: dbDetails["user"],
  password: dbDetails.password,
  database: dbDetails.database,
});
}


module.exports = {
  dbConnection,
};


