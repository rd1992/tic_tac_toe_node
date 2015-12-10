/** 
This class handles the reading and writing of user data to the MongoDB. 
Creates new users and handles login of existing users . Also fetches a user's past games
**/
'use strict';
var crypto = require('crypto');

var User = function() {};

User.prototype.find_by_username = function(db, user_name, callback) {
  db.collection('users').findOne({user_name: user_name}, callback);
};

User.prototype.find_by_username_password = function(db, user_name, password, callback) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(password);
  var hashed_password = sha1.digest('hex');
  db.collection('users').findOne({user_name: user_name, password: hashed_password}, callback);
};

User.prototype.create = function(db, full_name, user_name, password, callback) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(password);
  var hashed_password = sha1.digest('hex');
  db.collection('users').insert({'full_name': full_name, 'user_name': user_name, 'password': hashed_password}, callback);
};

User.prototype.get_past_games = function(db, user_name, callback) {
	var result = [];
  var cursor = db.collection('games').find({'$or':[{player1_user_name: user_name}, {player2_user_name: user_name}]});
  cursor.each(function(err, item) {
    if (item == null) 
      return callback(null, result);
    result.push(item);
  });
};

module.exports = User;