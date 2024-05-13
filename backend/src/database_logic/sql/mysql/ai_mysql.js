const{ DEBUG } = require("../../../env.js");
const sql = require("../sql.js");
const { dbConnection } = require("./mysql.js");

async function insertLatestImagesAndExpectedCurrentYieldIntoPlantbatch(plantBatchId, expectedCurrentYield, latestImageBinary){
    let sqlQuery = `
    UPDATE PlantBatch SET ExpectedYield = ?, LatestImage = ? WHERE PlantBatchId = ?`;
    await dbConnection.execute(sqlQuery,[expectedCurrentYield,latestImageBinary,plantBatchId]);
    return 1;
}



module.exports = { 
    insertLatestImagesAndExpectedCurrentYieldIntoPlantbatch,
}