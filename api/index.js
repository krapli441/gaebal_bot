const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("기본 페이지");
});

module.exports = app;
