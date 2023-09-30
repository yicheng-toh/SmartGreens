const mysql = require('mysql2');
const dbDetails = require('yc_data');

module.exports = mysql.createConnection({
    host: dbDetails.host,
    user: dbDetails.user,
    password: dbDetails.password,
    database:  dbDetails.database,

})