const express = require("express");
const checkIn = require("./attendanceCheckIn");
const checkOut = require("./attendanceCheckOut");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/attendance/checkIn", checkIn);
app.post("/api/attendance/checkOut", checkOut);

module.exports = app;
