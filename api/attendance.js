const express = require("express");
const checkIn = require("./attendanceCheckIn");
const checkOut = require("./attendanceCheckOut");
const checkHistory = require("./checkHistory");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/attendance/checkIn", checkIn);
app.post("/api/attendance/checkOut", checkOut);
app.post("/api/attendance/checkHistory", checkHistory);

module.exports = app;
