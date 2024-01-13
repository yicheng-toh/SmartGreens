require('dotenv').config();
const DEPLOYMENT = process.env.DEPLOYMENT === 'true';
const DATABASE = process.env.DATABASE || 'SQLite_MySQL';
const DOCKER = process.env.Docker === 'true';
const MYSQL = {
    'ROOT_PASSWORD' : process.env.MYSQL_ROOT_PASSWORD,
    'DATABASE' : process.env.MYSQL_DATABASE,
    'USER' : process.env.MYSQL_USER,
    'PASSWORD' : process.env.MYSQL_PASSWORD,
    'HOST' : "mysql",
};
console.log(`docker is ${DOCKER}`);

const MSSQL = process.env.MSSQL === "true" || false;
let config;
if (MSSQL){
    // config = {
    //     server: process.env.AZURE_SQL_SERVER,
    //     database: process.env.AZURE_SQL_DATABASE,
    //     port: parseInt(process.env.AZURE_SQL_PORT),
    //     user: process.env.AZURE_SQL_USER,
    //     password: process.env.AZURE_SQL_PASSWORD,
    //     options:{
    //         encrypt: process.env.AZURE_SQL_ENCRYPT === 'true'|| true, // Convert string to boolean
    //         database: process.env.AZURE_SQL_DATABASE,
    //         trustServerCertificate: false,
    //         debug: {
    //             packet: true,
    //             payload: true,
    //             token: false,
    //             data: true,
    //         },
    //     },
    //     connectionTimeout: parseInt(process.env.AZURE_SQL_CONNECTION_TIMEOUT, 10) || 30,
    // };
    config = {
        server: 'smartgreenbackendatabase.database.windows.net',
        database: 'smartgreenBackendDatabase',
        port: parseInt(1433),
        user: 'EE4002D',
        password: 'EEfyp?!!',
        options:{
            encrypt: process.env.AZURE_SQL_ENCRYPT === 'true'|| true, // Convert string to boolean
            database: process.env.AZURE_SQL_DATABASE,
            trustServerCertificate: false,
            debug: {
                packet: true,
                payload: true,
                token: false,
                data: true,
            },
        },
        connectionTimeout: parseInt(process.env.AZURE_SQL_CONNECTION_TIMEOUT, 10) || 30,
    };
}




module.exports = {
    DEPLOYMENT,
    DATABASE,
    DOCKER,
    MYSQL,
    MSSQL,
    config
}