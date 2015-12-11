/** 
This class handles the writing of game data to the MongoDB. 
It also maintains the game state for the players.
**/

'use strict';
var Game = function() {
  // These variables store the players playing the game, winner(if any) as well as the final state of the game board.
  this.players = {};
  this.winner = null;
  this.board = [['0', '0', '0'], ['0', '0', '0'], ['0', '0', '0']];
};

// updates the players playing the game
Game.prototype.update_players = function(user_name) {
  if (Object.keys(this.players).length === 0) {
    this.players[user_name] = 'x';
  } else if (!(user_name in this.players)) {
    this.players[user_name] = 'o';
  }
};

// Helper method to check if game is a draw
Game.prototype.is_game_draw = function() {
  for(var i = 0; i < this.board.length; i++) {
    for(var j = 0; j < this.board[i].length; j++) {
      if(this.board[i][j] === '0') return false;
    }
  }
  return true;
};

// Helper method to check if game is over (there is a winner). Triggered on every move
Game.prototype.is_game_over = function(coordinates, mark) {
  var vertical_winner = true;
  var horizontal_winner = true;
  var diagonal_winner = true;

  var row = coordinates.split('')[0];
  var col = coordinates.split('')[1];

  // horizontal winner
  for(var i = 0; i < this.board[0].length; i++) {
    if(this.board[row][i] !== mark) {
      horizontal_winner = false;
      // break;
    }
  }
  if(horizontal_winner) return true;

  // vertical winner
  for(var i = 0; i < this.board.length; i++) {
    if(this.board[i][col] !== mark) {
      vertical_winner = false;
      break;
    }
  }

  if(vertical_winner) return true;

  // diagonal winner
  for(var i = 0, j = 0; i < this.board[0].length; i++) {
    if(this.board[j++][i] !== mark) {
      diagonal_winner = false;
      break;
    }
  }

  if(diagonal_winner) return true;
  
  diagonal_winner = true;
  for(var i = this.board[0].length - 1, j = 0; i >= 0 ; i--) {
    if(this.board[j++][i] != mark) {
      diagonal_winner = false;
      break;
    }
  }

  return diagonal_winner;
};

// updates the game board on every move
Game.prototype.update_board = function(coordinates, mark) {
  var row = coordinates.split('')[0];
  var col = coordinates.split('')[1];
  this.board[row][col] = mark;
};

// saves game to the MongoDB store
Game.prototype.save_game = function(db, callback) {
  db.collection('games').insert({player1_user_name: Object.keys(this.players)[0], player2_user_name: Object.keys(this.players)[1], 
    board: this.board, created_on: new Date(), winner:this.winner}, function(err, result) {
    if(err) return callback(err);
    callback(null, Array.isArray(result) ? result[0] : result);
  });
};

Game.prototype.reset = function() {
  this.players = {};
  this.winner = null;
  this.board = [['0', '0', '0'], ['0', '0', '0'], ['0', '0', '0']];
};

module.exports = Game;
