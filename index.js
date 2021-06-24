var express = require('express');
require('dotenv').config();
var app = express();
var db = require('./db_config');
var redis = require('redis');
var client = redis.createClient(
  process.env.REDIS_PORT, process.env.REDIS_HOST
);
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('pages/index');
})
app.post('/add_data', function(req,res){
  let sql = `INSERT INTO test VALUE("","KEY1","VALUE1")`;
  db.query(sql, function (err, result) {
    if (err) res.status(500).send(err);
    res.send(result);
    client.del('datatest');
  });
})
app.get('/get_data', function (req, res) {
  client.get('datatest', function (err,data) {
    //jika data null maka data ambil dari query dan ngeset ke redis
    if (err || data === null) {
      let sql = `SELECT * FROM test`;
      db.query(sql, function (err, result) {
        if (err) res.status(500).send(err);
        client.set('datatest', JSON.stringify(result))
        res.send({ message: 'data from query', data: result});
      });
    }else{
      res.send({ message: 'data from redis', data: JSON.parse(data) });
    }
  })
})

app.listen(process.env.APP_PORT, function () {
  console.log("Listening pada port " + process.env.APP_PORT)
})