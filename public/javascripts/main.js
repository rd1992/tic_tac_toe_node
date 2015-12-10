'use strict';

// Variables which keep track of the game api as well as store user information and game state
var game = new Tic_Tac_Toe();
var _user_name = null;
var _start_game = false;
var _players = null;
var _mark = 'x';

game.on('init', function(err, data) {});

// triggered when two users have joined. Updates the DOM
game.on('game_start', function(err, data) {
  if(err) return;
  var showed_x, showed_o = false;
  _players = data;
  for (var i in data) {
    if(data[i] == 'x') {
      $('#p1').html(i + ": <span style='color:red'>X</span>");
      showed_x = true;
    }
    else if(data[i] == 'o') {
      $('#p2').html(i + ": <span style='color:blue'>O</span>");
      showed_o = true;
    }
  }

  if(!showed_x) $('#p1').html('Waiting...');
  if(!showed_x) $('#p2').html('Waiting...');

  if(showed_x && showed_o) _start_game = true;
});

// triggered when a player (self of opponent) makes a move. Updates the DOM
game.on('game_move', function(err, data) {
  if(err) return;
  var cell_id = '#' + data.cell;
  if($.trim($(cell_id).html()) == '') {
    if( _mark == 'x') {
      $(cell_id).html('X');
      _mark = 'o';
      $(cell_id).css('color','red');
    } else {
      $(cell_id).html('O');
      $(cell_id).css('color','blue');
      _mark = 'x';
    }  
  }
});

// The game was a draw or a win or a loss. Shows a modal message with the result
game.on('game_over', function(err, data) {
  if(data.draw === true) {
    general_box_show('It was a draw', '<p>Your equally good, it is a draw</p>');
  } else if(data.winner == _user_name) {
    general_box_show('Congratulations', '<p>You won</p>');
  } else {
    general_box_show('You lost', '<p>Try harder next time</p>');
  }
});

// triggered when the user clicks on the register button on the main page.
// The game api will send the server the user details
var register_button_handler = function(game) {
  return function() {    
    var full_name = $('#full_name_register').val();
    var user_name = $('#user_name_register').val();
    var password = $('#password_register').val();
    _user_name = user_name;

    game.register(full_name, user_name, password, function(err, data) {
      if(err) return error_box_show(err.error);
      render_view('#dashboard');
    });
  };
};

// triggered when the user clicks on the login button on the main page.
// The game api will send the server user details to be verified
var login_button_handler = function(game) {
  return function() {
    var user_name = $('#user_name_login').val();
    var password = $('#password_login').val();
    _user_name = user_name;

    game.login(user_name, password, function(err, data) {
      if(err) return error_box_show(err.error);
      render_view('#dashboard');
    });
  };
};

// starts a new game
var new_game_button_handler = function(game) {
  return function() {
    game.player_connected(_user_name, function(err, data) {
      if(err) return error_box_show(err.error);
      render_view('#game');
    });
  };
};

// shows the past games played by the user
var past_game_button_handler = function(game) {
  return function() {
    $.get('/past_games',{user_name:_user_name}, function(data) {
      populate_table(data);
      render_view('#past_games');
    });
  };
};

// changes views
function render_view(view_id) {
  $('#login').hide();
  $('#dashboard').hide();
  $('#game').hide();
  $('#past_games').hide();
  $('#past_game_board').hide();
  $(view_id).show();
}

// triggered when the box on the game board is clicked
var mark_box = function(coordinates) {
  if(_start_game) {
    if(_players[_user_name] != _mark) {
       $('#stats').html('Not your turn').hide().fadeIn(1000).fadeOut(1000);
    } else {
      if($.trim($(coordinates).html()) == '') {

        game.mark_cell(_user_name, coordinates.id, _mark, function(err, data) {
          if (err) return error_box_show(err.error);
        });
      } else {
        $("#stats").html('Invalid move').hide().fadeIn(1000).fadeOut(1000);
      }
    }
  } else {
    $("#stats").html('Pending extra player...').hide().fadeIn(1000).fadeOut(1000);
  }
};

// shows the past games table
var populate_table = function(data) {
  for (var i = 0;i < data.length;i++) {
    var opponent = (data[i].player1_user_name == _user_name) ? data[i].player2_user_name : data[i].player1_user_name;
    var winner = data[i].winner;
    var time = data[i].created_on;
    var board = JSON.stringify(data[i].board);
    var game_num = i+1;
    var color = (winner == _user_name) ? 'success' : ((winner == 'draw') ? 'info' : 'error');

    var board_details = $(document.createElement('td'));
    board_details.html('View');
    board_details.attr('data-val', board);
    var html = '<tr class = ' + color + '>'
        + '<td>'+ game_num +'</td>'
        + '<td>'+ opponent +'</td>'
        + '<td>'+ winner +'</td>'
        + '<td>'+ time +'</td></tr>';
    $('#past_games > tbody:last-child').append(html);
    $('#past_games > tbody:last-child > tr:last-child').append(board_details);
    $('#past_games > tbody:last-child > tr:last-child > td:last-child').click(function(){
      show_board($(this).data('val'));
    });
  }
};

 // Helper methods
 
var error_box_show = function(error) {
  $('#status_box_header').html('Error');
  $('#status_box_body').html(error);
  $('#status_box').modal({backdrop:true, show:true});  
};

var general_box_show = function(title, body) {
  $('#status_box_header').html(title);
  $('#status_box_body').html(body);
  $('#status_box').modal({backdrop:true, show:true});  
};

// shows the past game board state (final state only)
var show_board = function(board) {
  for (var row = 0; row < board.length; row++) {
    for (var col = 0; col < board.length; col++) {
      var cell_id = '#' + row.toString() + col.toString() +'_past'; 
      if (board[row][col] !== '0') {
        $(cell_id).html(board[row][col].toUpperCase());
      }
      if (board[row][col] == 'x') {
        $(cell_id).css('color', 'red');
      } else if (board[row][col] == 'o') {
        $(cell_id).css('color', 'blue');
      }
    }
  }
  render_view('#past_game_board');
};

$(document).ready(function() {
  $('#register_button').click(register_button_handler(game));
  $('#login_button').click(login_button_handler(game));
  $('#new_game_button').click(new_game_button_handler(game));
  $('#past_game_button').click(past_game_button_handler(game));

  $('#game_table td.cell').click(function(e) {
    mark_box(e.currentTarget);
  });
});