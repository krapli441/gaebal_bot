const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./config/firebase.js");

const attendanceRoutes = require("./api/attendance");
const slackChannelIdRoutes = require("./api/slackChannelId");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/attendance", attendanceRoutes);
app.use("/api/slackChannelId", slackChannelIdRoutes);

module.exports = app;
