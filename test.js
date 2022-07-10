game = function() {
  var game_id;
  var peer;
  var connection;
  var is_main;
  var status_callback = function(message) { };

  function status(message) {
    console.log(message);
    status_callback(message);
  }

  function on_status(callback) {
    status_callback = callback;
  }

  function setup(id) {
    status('trying to setup as '+id)
    peer = new Peer(id);

    peer.on('open', (id) => {
      status('my id is '+id);

      if(!game_id) {
        // use my id as hash
        game_id = peer.id
        location.hash = '#'+game_id;
      }

      connect();
    });

    peer.on('error', (e) => {
      console.log('error '+e);
      if(e.type == 'unavailable-id') {
        setup();
      }
    });
  }

  function connect() {
    if(peer.id == game_id) {
      // I'm the main user
      is_main = true;
      peer.on('connection', function(c) {
        status('got connection');
        connection = c;
        setup_connection();
      });
      return;
    }
    is_main = false;

    // try to connect
    status('connecting to '+game_id);
    connection = peer.connect(game_id, {reliable: true});
    setup_connection();
  }

  function setup_connection() {
    connection.on('open', function() {
      status('connected to '+game_id);
    });
    connection.on('close', function() {
      status('lost connection');
    });
    connection.on('error', function() {
      status('error');
    });
    connection.on('data', function(data) {
      console.log('received '+data);
      add_chat(data);
    });
  }

  function add_chat(s) {
    p = $('<p>');
    p.text(s);
    $('#chat').append(p);
  }

  function init() {
    game_id = location.hash.substring(1)
    peer;
    setup(game_id);
  }

  function send(message) {
    add_chat(message);
    if(is_main) {
      connection.send(message);
    }
    else {
      connection.send(message);
    }
  };

  return {
    init: init,
    send: send,
    on_status: on_status
  };
}();

$(function() {
  game.on_status(function(s) {
    $('#status').text(s);
  });
  game.init();

  $('#send-form').submit(function() {
    game.send($('#send-input').val())
    $('#send-input').val('')
    return false;
  });
})
