'use strict';
var game = require('../models/game');
var user = require('../models/user');

var players = {};
var board = {'#00':'', '#01':'', '#02':'', '#10':'', '#11':'', '#12':'', '#20':'', '#21':'', '#22':''};
var winner = null;

var registration_controller = function(io, socket, db) {
	return function(data) {
    var full_name = data.full_name;
    var user_name = data.user_name;
    var password = data.password;
    user(db).find_by_username(user_name, function(err, res) {
      if(err) return error_message(err.message, socket);
      if(res !== null) { 
        return error_message('register', 'User with user name ' + user_name + ' already exists', socket);
      }
      user(db).create(full_name, user_name, password, function(err, res) {
        if(err) return error_message('register', err.message, socket);
        return no_error_message('register', {ok:true}, socket);
      });
    });
	};
	
};

var login_controller = function(io, socket, db) {
	return function(data) {
    var user_name = data.user_name;
    var password = data.password;

    user(db).find_by_username_password(user_name, password, function(err, res) {
      if(err) return error_message('login', err.message, socket);
      if(res === null) return error_message('login', 'User or Password is incorrect', socket);
      return no_error_message('login', {ok:true}, socket);
    });
	};
};

var player_controller = function(io, socket, db) {
  return function(data) {
    update_players(io, socket, db, data.user_name);
    return no_error_message('player_connected', {ok:true}, socket);
  };
};

var cell_controller = function(io, socket, db) {
	return function(data) {
    board[data.cell] = data.mark;
     io.emit('data', {'event':'game_move','result': data});
    if (is_game_over()) {
      winner = data.player;
      io.emit('data', {'event':'game_over','result': {draw:false, winner:winner}});
      
    }
    else if (is_game_draw()) {
      winner = 'draw';
      io.emit('data', {'event':'game_over','result': {draw:true}});
    }

    //save a completed game
    if (winner !== null) {
      game(db).save_game(Object.keys(players)[0], Object.keys(players)[1], board, winner, function(err, res) {
        if(err) console.log(err.error);
      }); 
    }
	};
};

var past_game_controller = function(io, socket, db) {
  return function(data) {
    game(db).find_games_by_user(data.user_name, function(err, res) {
      if(err) return error_message('view_past_games', err.message, socket);
      return no_error_message('view_past_games', {'result':res}, socket);
    });
  };
};

var update_players = function(io, socket, db, user_name) {
  if (Object.keys(players).length == 2) {
    io.emit('data', {'event':'game_start','result': players});
  } else if (Object.keys(players).length == 1) {
    if (!(user_name in players)) {
      players[user_name] = 'o';
      io.emit('data', {'event':'game_start','result': players});
    }
  } else {
    players[user_name] = 'x';
  }
};

var is_game_draw = function() {
  for (var i in board) {
    if (board[i] === '') return false;
  }
  return true;
};

var is_game_over = function() {
  
  // horizontal winner
  if((board['#00'] == board['#01'] && board['#01'] == board['#02'] && board['#00'] !== '') || 
     (board['#10'] == board['#11'] && board['#11'] == board['#12'] && board['#10'] !== '') ||
     (board['#20'] == board['#21'] && board['#21'] == board['#22'] && board['#20'] !== '')) {
      return true;
  }

  // vertical winner
  if((board['#00'] == board['#10'] && board['#10'] == board['#20'] && board['#00'] !== '') || 
     (board['#01'] == board['#11'] && board['#11'] == board['#21'] && board['#01'] !== '') ||
     (board['#02'] == board['#12'] && board['#12'] == board['#22'] && board['#02'] !== '')) {
      return true;
  }
  
  //diagonal winner
  if((board['#00'] == board['#11'] && board['#11'] == board['#22'] && board['#00'] !== '') ||
     (board['#20'] == board['#11'] && board['#11'] == board['#02'] && board['#20'] !== '')) {
      return true; 
  }

  return false;
};

var error_message = function(event, err, socket) {
  if(Array.isArray(socket)) {
    for(var i = 0; i < socket.length; i++) {
      socket[i].emit('data', {'event':event, 'ok': false, 'is_error':true, 'error': err});       
    }
  } else {
    socket.emit('data', {'event':event, 'ok': false, 'is_error':true, 'error': err});    
  }
};

var no_error_message = function(event, msg, socket) {
  msg.event = event;
  socket.emit('data', msg);
};

exports.registration_controller = registration_controller;
exports.login_controller = login_controller;
exports.cell_controller = cell_controller;
exports.player_controller = player_controller; 
exports.past_game_controller = past_game_controller;