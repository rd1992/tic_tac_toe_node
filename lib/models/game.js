/** 
This class handles the reading and writing of game data to the MongoDB. 
Saves a finished game and also fetches past games 
**/

'use strict';
var Game = function() {
  // These variables store the players playing the game, winner(if any) as well as the final state of the game board.
  this.players = {};
  this.winner = null;
  this.board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
};

Game.prototype.update_players = function(user_name) {
  if (Object.keys(this.players).length === 0) {
    this.players[user_name] = 'x';
  } else if (!(user_name in this.players)) {
    this.players[user_name] = 'o';
  }
  console.log(this.players);
};

// Helper method to check if game is a draw
Game.prototype.is_game_draw = function() {
  for(var i = 0; i < this.board.length; i++) {
    for(var j = 0; j < this.board[i].length; j++) {
      if(this.board[i][j] === 0) return false;
    }
  }
  return true;
};

// Helper method to check if game is over (there is a winner)
Game.prototype.is_game_over = function() {
  
  // horizontal winner
  for (var row in this.board) {
    console.log(row);
  }
};

Game.prototype.update_board = function(coordinates, mark) {
  var row = coordinates.split('')[0];
  var col = coordinates.split('')[1];
  this.board[row][col] = mark;
};

Game.prototype.save_game = function(db, callback) {
  db.collection('games').insert({player1_user_name: this.players[0], player2_user_name: this.players[1], 
    board: this.board, created_on: new Date(), winner:this.winner}, function(err, result) {
    if(err) return callback(err);
    callback(null, Array.isArray(result) ? result[0] : result);
  });
};

module.exports = Game;
