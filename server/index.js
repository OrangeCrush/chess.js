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
      ChessTimer: '../public/js/src/chessTimer',
      GameRoomManager: 'gameRoomManager',
      AIGameManager: 'AIGameManager',
      RandomAI: './ai/RandomAI',
      CapturerAI: './ai/CapturerAI'
   },
   baseUrl: __dirname,
   nodeRequire: require
});

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var bodyParser = require('body-parser');
app.use(bodyParser.json());


var GameRoomManager = requirejs('GameRoomManager');
var AIGameManager = requirejs('AIGameManager');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

app.use(express.static(__dirname + '/../public'));

var port = 3000;
console.log('Express app started on port '+port);

var gm = new GameRoomManager({
   iosockets: io.sockets,
   ioclients: io.clients
});

// TODO add ai class here
var aiMan = new AIGameManager({
  ai: function() {
    
  }
});

//Every 5 seconds gather players and create games
setInterval(function(){
   var queue = [];
   for(var id in gm.waiting){
      if(!gm.disconnected[id]){//queue up connected players
         queue.push(gm.waiting[id])
      }else{//remove diconnected players from queue
         console.log('filtered disconnected player: ' + id);
         delete gm.disconnected[id];
      }
      delete gm.waiting[id]; //remove from waiting list
   }

   var numGames = Math.floor(queue.length / 2);
   console.log('Starting ' + numGames + ' new games');
   for(var i = 0; i < numGames; i++){
      var gameid = gm.generateNewGame(queue.shift(), queue.shift(), null);
      console.log('Created game with id:' +  gameid); //TODO idk how to handle game options yet
      console.log('    player1: ' + gm.games[gameid].player1.id);
      console.log('    player2: ' + gm.games[gameid].player2.id);
   }
   if(queue.length > 0){
      gm.waiting[queue[0].id] = queue[0];//push back the odd player out
   }

   console.log('Printing Waiting queue:')
   console.log(Object.keys(gm.waiting));
}, 5000);

io.sockets.on('connection', function(socket){
   console.log(socket.id + ' is up.');
   socket.emit('connected', {timestamp: new Date()});

   //Places the player in the game queue and begins socket communication
   //gm.joinGame(socket); disable multiplayer for now

   socket.on('watch', function(data){
      //todo..
   });

   //Todo don't let someone else run a move.. etc
   socket.on('move', function(data){
      gm.runMove(data.id, data.color, data.pgnMove);
   });

   socket.on('chat', function(data){
      io.sockets.in(data.id).emit(data.msg);
   });

   /*
    * Add them to a disconnected queue to be removed in
    * the interval (don't want to remove them from the same array)
    */
   socket.on('disconnect', function(data){
      console.log(socket.id + ' is down.');
      gm.playerDisconnected(socket);
   });


  // Single player events
  socket.on('playerMove', function(data) {
    var turnData = aiMan.processMove(data.gameId, data.pgnMove)
    socket.emit('cpuMove', {
      'cpuMove': turnData.cpuMove,
      'color'  : turnData.color
    });
  });
});

// Single Player logic
app.get('/game/:gameId', function(req, res){
  res.json(aiMan.getGame(req.params.gameId));
});

app.post('/newgame', function(req, res) {
  var id = aiMan.setupNewGame(req.body.playerTeam, req.body.ai);
  res.json({gameId: id});
});

server.listen(port);
