/**
 * Module dependencies.
 */

var requirejs = require('requirejs');

requirejs.config({
   paths:{
      Game: '../public/js/src/game',
      Board: '../public/js/src/board',
      Piece: '../public/js/src/piece',
      Utils: '../public/js/src/utils',
      SingletonContainer: '../public/js/src/singletonContainer',
      GameRoomManager: 'gameRoomManager'
   },
   baseUrl: __dirname,
   nodeRequire: require
});

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

io.set('log level', 3);

var GameRoomManager = requirejs('GameRoomManager');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

app.use(express.static(__dirname + '/../public'));

var port = 3000;
console.log('Express app started on port '+port);

var gm = new GameRoomManager({
   iosockets: io.sockets
});

//Every 5 seconds gather players and create games
setInterval(function(){
   var numGames = Math.floor(gm.waiting.length / 2);
   console.log('Starting ' + numGames + ' new games');
   for(var i = 0; i < numGames; i++){
      console.log('Created game with id:' +  gm.generateNewGame(gm.waiting.shift(), gm.waiting.shift(), null)); //TODO idk how to handle game options yet
   }
}, 5000);

io.sockets.on('connection', function(socket){
   socket.emit('connected', {timestamp: new Date()});

   //Places the player in the game queue and begins socket communication
   gm.joinGame(socket);

   socket.on('watch', function(data){
      //todo..
   });

   //Todo don't let someone else run a move.. etc
   socket.on('move', function(data){
      console.log('checking move: '  + data.pgnMove);
      gm.runMove(data.id, data.color, data.pgnMove);
   });

   socket.on('chat', function(data){
      //todo..
   });

   socket.on('gameOver', function(data){
      //todo..
   });
});

server.listen(port);
