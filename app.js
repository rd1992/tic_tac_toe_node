'use strict';

var env_setup = require('./env_setup');
var register = require('./lib/controllers/main.js').registration_controller;
var login = require('./lib/controllers/main.js').login_controller;
var mark_cell = require('./lib/controllers/main.js').cell_controller;
var player_controller = require('./lib/controllers/main.js').player_controller;
var past_game_controller = require('./lib/controllers/main.js').past_game_controller;

env_setup.init(function(err, app, io, database) {
  if (err) throw err;

  app.get('/', function(req, res){
    res.render('index');
  });

  io.sockets.on('connection', function(socket) {
    socket.on('register', register(io, socket, database));
    socket.on('login', login(io, socket, database));
    socket.on('mark_cell', mark_cell(io, socket, database));
    socket.on('player_connected', player_controller(io, socket, database));
    socket.on('view_past_games', past_game_controller(io, socket, database));
    socket.emit('data', {event:'init', ok:true, result: socket.handshake.sessionID});
  });

  env_setup.run_game(function(err){
    if (err) throw err;
  });
});
