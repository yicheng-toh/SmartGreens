const { json } = require("express");
const express = require("express");
const router = express.Router({mergeParams: true});
const {sendBadRequestResponse, sendInternalServerError} = require("../request_error_messages.js")
const mysqlLogic = require("../../database_logic/sql/sql.js")
/**
 * @swagger
 * tags:
 *   name: Misc
 *   description: Routes for miscellaneous like energy calculation.
 */


/**
 * @swagger
 * /energyConsumption:
 *   get:
 *     summary: Get energy consumption data.
 *     description: Retrieve energy consumption data.
 *     responses:
 *       200:
 *         description: Successful response with data.
 *         content:
 *           application/json:
 *             example:
 *               success: 1
 *               result: "Where can I get the data from?"
 *       500:
 *         description: Internal Server Error.
 */
router.get('/energyConsumption', async(req, res) => {
    try {
    //   const [rows] = await mysqlLogic.getAllPlantInfo();
    //   res.status(200).json({success:1, result:rows});
      res.status(200).json({success:1, result:"Where can I get the data from?"});
    } catch (error) {
      console.log('Error retrieving data:', error);
      sendInternalServerError(res);
    }
});

module.exports = router;