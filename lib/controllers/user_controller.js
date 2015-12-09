/** 
The main file for communicating between the clients and the MongoDB database.
This file reads/writes to the MongoDB store as well as triggers messages on sockets.
**/
'use strict';
var User = require('../models/user');
var user = new User();
var error_message = require('./helpers').error_message;
var no_error_message = require('./helpers').no_error_message;

// triggered when the register message is sent from a client. Checks if the user already exists in the DB before registering a new user.
var register = function(socket, db) {
	return function(data) {
    var full_name = data.full_name;
    var user_name = data.user_name;
    var password = data.password;
    user.find_by_username(db, user_name, function(err, res) {
      if(err) return error_message(err.message, socket);
      if(res !== null) { 
        return error_message('register', 'User with user name ' + user_name + ' already exists', socket);
      }
      user.create(db, full_name, user_name, password, function(err, res) {
        if(err) return error_message('register', err.message, socket);
        return no_error_message('register', {ok:true}, socket);
      });
    });
	};
	
};

// triggered when the login message is sent from a client. Checks if the user exists in the DB.
var login = function(socket, db) {
	return function(data) {
    var user_name = data.user_name;
    var password = data.password;

    user.find_by_username_password(db, user_name, password, function(err, res) {
      if(err) return error_message('login', err.message, socket);
      if(res === null) return error_message('login', 'User or Password is incorrect', socket);
      return no_error_message('login', {ok:true}, socket);
    });
	};
};

exports.register = register;
exports.login = login;