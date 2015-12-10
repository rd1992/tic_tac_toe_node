'use strict';

var env_setup = require('./env_setup');
var register = require('./lib/controllers/user_controller.js').register;
var login = require('./lib/controllers/user_controller.js').login;
var mark_cell = require('./lib/controllers/game_controller.js').mark_cell;
var new_player = require('./lib/controllers/game_controller.js').new_player;
var past_games = require('./lib/controllers/user_controller.js').past_games;

env_setup.init(function(err, app, io, database) {
  if (err) throw err;

  app.get('/', function(req, res){
    res.render('index');
  });

  app.get('/past_games', function(req, res){
    past_games(database, req.query.user_name, function(result) {
      res.send(result);
    });
  });

  io.sockets.on('connection', function(socket) {
    socket.on('register', register(socket, database));
    socket.on('login', login(socket, database));
    socket.on('mark_cell', mark_cell(io, socket, database));
    socket.on('player_connected', new_player(io, socket, database));
    socket.emit('data', {event:'init', ok:true, result: null});
  });

  env_setup.run_game(function(err){
    if (err) throw err;
  });
});
