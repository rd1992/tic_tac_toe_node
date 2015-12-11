// Helper method to return error messages in the right format
var error_message = function(event, err, socket) {
  if(Array.isArray(socket)) {
    for(var i = 0; i < socket.length; i++) {
      socket[i].emit('data', {'event':event, 'ok': false, 'is_error':true, 'error': err});       
    }
  } else {
    socket.emit('data', {'event':event, 'ok': false, 'is_error':true, 'error': err});    
  }
};

// Helper method to return messages in the right format
var no_error_message = function(event, msg, socket) {
  msg.event = event;
  socket.emit('data', msg);
};

exports.no_error_message = no_error_message;
exports.error_message = error_message;