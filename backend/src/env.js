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
console.log(DOCKER);


module.exports = {
    DEPLOYMENT,
    DATABASE,
    DOCKER,
    MYSQL,
}