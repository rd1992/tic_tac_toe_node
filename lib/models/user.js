'use strict';
var crypto = require('crypto');
module.exports = function(db) {
  var User = function() {};

  User.find_by_username = function(user_name, callback) {
    db.collection('users').findOne({user_name: user_name}, callback);
  };

  User.find_by_username_password = function(user_name, password, callback) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(password);
    var hashed_password = sha1.digest('hex');
    db.collection('users').findOne({user_name: user_name, password: hashed_password}, callback);
  };

  User.create = function(full_name, user_name, password, callback) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(password);
    var hashed_password = sha1.digest('hex');
    db.collection('users').insert({'full_name': full_name, 'user_name': user_name, 'password': hashed_password}, callback);
  };
    
  return User;
};