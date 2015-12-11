/** 
The game file for communicating between the clients and the MongoDB database.
This file reads/writes game details to the MongoDB store as well as triggers messages on sockets.
**/
'use strict';
var Game = require('../models/game');
var game = new Game();
var error_message = require('./helpers').error_message;
var no_error_message = require('./helpers').no_error_message;

// triggered when a user wants to play a new game
var new_player = function(io, socket, db) {
  return function(data) {
    game.update_players(data.user_name);
    if (Object.keys(game.players).length == 2) {
      io.emit('data', {'event':'game_start','result': game.players});
    }
    return no_error_message('player_connected', {ok:true}, socket);
  };
};

// triggered when a cell is clicked by the user in the game. Checks if the game is over and informs both players of the result
var mark_cell = function(io, socket, db) {
	return function(data) {
    game.update_board(data.cell, data.mark);
    io.emit('data', {'event':'game_move','result': data});
    if (game.is_game_over(data.cell, data.mark)) {
      game.winner = data.player;
      io.emit('data', {'event':'game_over','result': {draw:false, winner:game.winner}});
    } else if (game.is_game_draw()) {
      game.winner = 'draw';
      io.emit('data', {'event':'game_over','result': {draw:true}});
    }

    //save a completed game
    if (game.winner !== null) {
      game.save_game(db, function(err, res) {
        if(err) console.log(err.error);
        game.winner = null;
        game.players = {};
        game.board = [['0', '0', '0'], ['0', '0', '0'], ['0', '0', '0']];
      }); 
    }
	};
};

exports.new_player = new_player;
exports.mark_cell = mark_cell;
