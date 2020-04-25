var express = require('express');

// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

var io = require('socket.io')(server);

var connectedPlayer = [];
var currentPlayer = 0;

function heartbeat() {
  io.sockets.emit('heartbeat');
}

io.sockets.on(
    'connection',
    // We are given a websocket object in our function
    function(socket) {
      console.log('We have a new client: ' + socket.id);
  
      socket.on('register', () => {
        connectedPlayer.push(socket.id);
        console.log('resgiter:', connectedPlayer.length);
        io.sockets.emit('start', { player: connectedPlayer, current: currentPlayer });
      });
  
      socket.on('roll', rolledNr => {
        console.log('roll:');
        io.sockets.emit('roll', rolledNr);
      });

      socket.on('move', player => {
        console.log('move:');
        currentPlayer = (currentPlayer+1)%6;
        io.sockets.emit('update', { player: player, currentPlayer: currentPlayer });
      });

      socket.on('movePin', data => {
        console.log('movePin:');
        io.sockets.emit('movePin', data);
      });

      socket.on('disconnect', function() {
        let playerNr = connectedPlayer.indexOf(socket.id)
        if (playerNr >= 0){
            connectedPlayer.splice(playerNr, 1);
            if (connectedPlayer.length <= 0) {
                currentPlayer = 0;
            }
        }
        io.sockets.emit('start', connectedPlayer);
        console.log('Client has disconnected');
      });
    }
  );

