/**
This class handles the api for the client and communicates with the game server.
Methods:
register : handles registration for a new user
login : handles login for an existing user
player connected : informs the server that a player has joined
mark cell : informs the server which cell was clicked
**/

'use strict';

var Tic_Tac_Toe = function() {
  var self = this;
  this.socket = io();
  this.handlers = {};
  this.once_handlers = {};

  this.socket.on('data', function(data) {
    if(data && data.event) {
      var handlers = self.handlers[data.event];
      if(handlers != null) {
        for(var i = 0; i < handlers.length; i++) {
          data.is_error ? handlers[i](data) : handlers[i](null, data.result);
        }
      }
      
      var handlers = self.once_handlers[data.event];
      if(handlers != null) {
        while(handlers.length > 0) {
          data.is_error ? handlers.pop()(data) : handlers.pop()(null, data.result);
        }
        delete self.once_handlers[data.event];
      }
    }
  });
};

Tic_Tac_Toe.prototype.on = function(event, callback) {
  if(this.handlers[event] == null) this.handlers[event] = [];
  this.handlers[event].push(callback);

};

Tic_Tac_Toe.prototype.once = function(event, callback) {
  if(this.once_handlers[event] == null) this.once_handlers[event] = [];
  this.once_handlers[event].push(callback);
};

Tic_Tac_Toe.prototype.register = function(full_name, user_name, password, callback) {  
  // Do basic validation
  if(full_name === null || full_name.length === 0) return callback(create_error('register', 'Full name cannot be empty'));
  if(user_name === null || user_name.length === 0) return callback(create_error('register', 'User name cannot be empty'));
  if(password === null || password.length === 0) return callback(create_error('register', 'Password name cannot be empty'));
  this.once('register', callback);
  this.socket.emit('register', {full_name: full_name, user_name: user_name, password: password});
};

Tic_Tac_Toe.prototype.login = function(user_name, password, callback) {  
  if(user_name === null || user_name.length === 0) return callback(create_error('login', 'User name cannot be empty'));
  if(password === null || password.length === 0) return callback(create_error('login', 'Password name cannot be empty'));
  this.once('login', callback);
  this.socket.emit('login', {user_name: user_name, password: password});
};

Tic_Tac_Toe.prototype.player_connected = function(user_name, callback) {
  this.once('player_connected', callback);
  this.socket.emit('player_connected', {user_name: user_name});
};

Tic_Tac_Toe.prototype.mark_cell = function(player, cell, mark, callback) {  
  this.once('mark_cell', callback);
  this.socket.emit('mark_cell', {player:player, cell: cell, mark:mark});
};

var create_error = function(event, err) {
  return {event: event, ok: false, is_error: true, error: err};
};
