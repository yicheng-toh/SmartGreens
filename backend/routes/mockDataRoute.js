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
// const { json } = require("express");
const express = require("express");

// const router = express.Router("./mockData");
const router = express.Router();

router.get("/mockBarData", (req, res) => {
  console.log("sending mockBarData");
  console.log(mockBarData);
  console.log("eh>");
  res.status(200).send(JSON.stringify(mockBarData));
});

router.get("/mockDataContacts", (req, res) => {
  console.log("sending mockDataContacts");
  console.log(mockDataContacts);
  console.log("eh?");
  res.status(200).send(JSON.stringify(mockDataContacts));
});

router.get("/mockDataInvoices", (req, res) => {
  console.log("sending mockDataInvoices");
  console.log(mockDataInvoices);
  console.log("eh?");
  res.status(200).send(JSON.stringify(mockDataInvoices));
});

router.get("/mockBarData", (req, res) => {
  console.log("sending mockBarData");
  console.log(mockBarData);
  console.log("eh?");
  res.status(200).send(JSON.stringify(mockBarData));
});

router.get("/mockDataTeam", (req, res) => {
  console.log("sending mockDataTeam");
  console.log(mockDataTeam);
  console.log("eh?");
  res.status(200).send(JSON.stringify(mockDataTeam));
});

router.get("/mockGeographyData", (req, res) => {
  console.log("sending mockGeographyData");
  console.log(mockGeographyData);
  console.log("eh?");
  res.status(200).send(JSON.stringify(mockGeographyData));
});

router.get("/mockLineData", (req, res) => {
  console.log("sending mockLineData");
  console.log(mockLineData);
  console.log("eh?");
  res.status(200).send(JSON.stringify(mockLineData));
});

router.get("/mockPieData", (req, res) => {
  console.log("sending mockPieData");
  console.log(mockPieData);
  console.log("eh?");
  res.status(200).send(JSON.stringify(mockPieData));
});

router.get("/mockTransactions", (req, res) => {
  console.log("sending mockTransactions");
  console.log(mockTransactions); //TODO not sure why need to do a console log to avoid error in the body.
  console.log("eh?");
  res.status(200).send(JSON.stringify(mockTransactions));
});

module.exports = router;
