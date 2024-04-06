const{ DEBUG } = require("../../../env.js");
const {createDbConnection} = require("./mssql.js");
const sql = require("mssql");

async function insertLatestImagesAndExpectedCurrentYieldIntoPlantbatch(plantBatchId, expectedCurrentYield, latestImageBinary){
    const dbConnection = await createDbConnection();
    const request = await dbConnection.connect();
    let sqlQuery = `
    UPDATE PlantBatch SET ExpectedYield = @ExpectedYield, LatestImage = @LatestImage WHERE PlantBatchId = @PlantBatchId`;
    await request
            .input('ExpectedYield', sql.Float, expectedCurrentYield)
            .input('PlantBatchId', sql.Int, plantBatchId)
            .input('LatestImage', sql.VarBinary, latestImageBinary)
            .query(sqlQuery);
    await dbConnection.disconnect();
    return 1;
}



module.exports = { 
    insertLatestImagesAndExpectedCurrentYieldIntoPlantbatch,
}