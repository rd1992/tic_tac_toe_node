'use strict';
module.exports = function(db) {
  var Game = function() {};

  Game.save_game = function(p1_user_name, p2_user_name, board, winner, callback) {
    db.collection('games').insert({player1_user_name: p1_user_name, player2_user_name: p2_user_name, 
      board: board, created_on: new Date(), winner:winner}, function(err, result) {
      if(err) return callback(err);
      callback(null, Array.isArray(result) ? result[0] : result);
    });
  };

  Game.find_games_by_user = function(user_name, callback) {
    var result = [];
    var cursor = db.collection('games').find({'$or':[{player1_user_name: user_name}, {player2_user_name: user_name}]});
    cursor.each(function(err, item) {
      if (item == null) 
        return callback(null, result);
      result.push(item);
    });
  };

  return Game;
};