const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./config/firebase.js");

const attendanceRoutes = require("./api/attendance");
const sendMessageRoutes = require("./api/sendMessage");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/attendance", attendanceRoutes);
app.use("/api/sendMessage", sendMessageRoutes);

module.exports = app;
