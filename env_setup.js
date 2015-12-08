'use strict';

var express = require('express');
var app = express();

var path = require('path');
var mongo_client = require('mongodb').MongoClient;
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var MONGO_URL = 'mongodb://localhost:27017/tinder';
var HOST = 'localhost';
var PORT = 8080;

var database = null;

var init = function(callback) {
  // express config
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(express.static(__dirname + '/public'));

  // mongo connection
  mongo_client.connect(MONGO_URL, function(err, _db) {
    if(err) return callback(err);
    database = _db;
    console.log("successfully connected to database");
    callback(null, app, io, database);
  });
};

var run_game = function(callback) {
  server.listen(PORT, HOST, function(err) {
    if(err) {
      database.close();
      return callback(err);
    }
    console.log('Server started....');
    callback(null);
  });
};

exports.init = init;
exports.run_game = run_game;