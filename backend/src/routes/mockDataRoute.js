// const data = require("mockData");
const {
  mockBarData,
  mockDataContacts,
  mockDataInvoices,
  mockDataTeam,
  mockGeographyData,
  // mockLineData,
  mockPieData,
  mockTransactions,
} = require("../mockData.js");
const { json } = require("express");
const express = require("express");

// const router = express.Router("./mockData");
const router = express.Router();

router.use(json());

router.get("/mockBarData", (req, res) => {
  if (DEBUG) console.log("sending mockBarData");
  // // if (DEBUG) console.log(mockBarData);
  // if (DEBUG) console.log("eh>");
  res.status(200).send(JSON.stringify(mockBarData));
});

router.get("/mockDataContacts", (req, res) => {
  if (DEBUG) console.log("sending mockDataContacts");
  // if (DEBUG) console.log(mockDataContacts);
  // if (DEBUG) console.log("eh?");
  res.status(200).send(JSON.stringify(mockDataContacts));
});

router.get("/mockDataInvoices", (req, res) => {
  if (DEBUG) console.log("sending mockDataInvoices");
  // if (DEBUG) console.log(mockDataInvoices);
  // if (DEBUG) console.log("eh?");
  res.status(200).send(JSON.stringify(mockDataInvoices));
});

router.get("/mockBarData", (req, res) => {
  if (DEBUG) console.log("sending mockBarData");
  // if (DEBUG) console.log(mockBarData);
  // if (DEBUG) console.log("eh?");
  res.status(200).send(JSON.stringify(mockBarData));
});

router.get("/mockDataTeam", (req, res) => {
  if (DEBUG) console.log("sending mockDataTeam");
  // if (DEBUG) console.log(mockDataTeam);
  // if (DEBUG) console.log("eh?");
  res.status(200).send(JSON.stringify(mockDataTeam));
});

router.get("/mockGeographyData", (req, res) => {
  if (DEBUG) console.log("sending mockGeographyData");
  // if (DEBUG) console.log(mockGeographyData);
  // if (DEBUG) console.log("eh?");
  res.status(200).send(JSON.stringify(mockGeographyData));
});

// router.get("/mockLineData", (req, res) => {
//   if (DEBUG) console.log("sending mockLineData");
//   if (DEBUG) console.log(mockLineData);
//   // if (DEBUG) console.log("eh?");
//   res.status(200).send(JSON.stringify(mockLineData));
// });

router.get("/mockPieData", (req, res) => {
  if (DEBUG) console.log("sending mockPieData");
  // if (DEBUG) console.log(mockPieData);
  // if (DEBUG) console.log("eh?");
  res.status(200).send(JSON.stringify(mockPieData));
});

router.get("/mockTransactions", (req, res) => {
  if (DEBUG) console.log("sending mockTransactions");
  // if (DEBUG) console.log(mockTransactions); //TODO not sure why need to do a console log to avoid error in the body.
  // if (DEBUG) console.log("eh?");
  res.status(200).send(JSON.stringify(mockTransactions));
});

module.exports = router;
