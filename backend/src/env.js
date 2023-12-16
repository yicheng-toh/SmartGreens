const DEPLOYMENT = process.env.DEPLOYMENT === 'true';
const DATABASE = process.env.DATABASE || 'SQLite_MySQL';


module.exports = {
    DEPLOYMENT,
    DATABASE,
}