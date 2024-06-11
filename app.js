const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./config/firebase.js");

const attendanceRoutes = require("./routes/attendance");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/attendance", attendanceRoutes);

module.exports = app;
