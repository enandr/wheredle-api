
require('dotenv').config();
const serverless = require("serverless-http");
const express = require("express");
const http = require("http");
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors({
  origin: '*'
}));
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DB
});

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/todayschallenge", (req, res, next) => {
  const today = new Date();
  const yyyy = today.getFullYear().toString();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const mm = month < 10 ? "0" + month : "" + month;
  const dd = day < 10 ? "0" + day : "" + day;
  const fullDate = `${mm}/${dd}/${yyyy}`;
  let sqlDate = `Select image from challenges where date = '${fullDate}'`;

  connection.query(sqlDate, function (err, rows, fields) {
    if (err) throw err
    var returnedRows = rows;
    res.send(returnedRows);
  })
});

app.post("/challenges", (req, res, next) => {
  let sql = `Select * from challenges`;
  const {date} = req.body;
  let sqlDate = `Select * from challenges where date = '${date}'`;

  connection.query(sqlDate, function (err, rows, fields) {
    if (err) throw err
    var returnedRows = rows;
    res.send(returnedRows);
  })
});

app.post("/checkcity", (req, res, next) => {
  const {city} = req.body;
  let sqlCity = `select city from cities where upper(city) = '${city}'`;

  connection.query(sqlCity, function (err, rows, fields) {
    if (err) throw err
    var returnedRows = rows;
    res.send(returnedRows.length > 0);
  })
});

app.post("/autocomplete", (req, res, next) => {
  const {city} = req.body;
  let sqlCity = `select city from cities where upper(city) like '${city}%'`;

  connection.query(sqlCity, function (err, rows, fields) {
    if (err) throw err
    var returnedRows = rows.map(cityName => {
      return cityName.city.toUpperCase()
    });
    res.send(returnedRows);
  })
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
