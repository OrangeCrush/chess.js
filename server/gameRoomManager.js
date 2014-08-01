if(typeof define !== 'function'){
   var define = require('amdefine')(module);
}
define(function(require, exports, module){
   var Game = require('Game');
   //map from game ids to game objects currently being player

   /*
    * This class is primarily responsible for the management of
    * player sockets as well as game validation and setting up
    */
   function GameRoomManager(init){
      /*
       * {
       *    GameID:{
       *       game: [Game object],
       *       player1: [Socket object],
       *       player2: [Socket object]
       *    },...
       * }
       */
      this.games = {};

      /*
       * {
       *    socketId:[Socket Object]
       * }
       */
      this.waiting = {}
      this.disconnected = {};

      //All sockets (for broadcasting to rooms)
      this.iosockets = init.iosockets;
   }

   /*
    * queue up waiting player's sockets.
    */
   GameRoomManager.prototype.joinGame = function(playerSocket){
      this.waiting[playerSocket.id] = playerSocket;
   }

   /*
    * Called in a 5 second interval above.
    * Creates a serverside instance of the game for validation
    * and emits a begin game event to each players socket
    */
   GameRoomManager.prototype.generateNewGame = function(player1Socket, player2Socket, gameOpts){
      var id = this.generateId();
      this.games[id] = {
         game: new Game({
            timed: true               //TODO need a way to pass options
         }),
         player1: player1Socket,
         player2: player2Socket
      };

      //Spin off a socketio room
      player1Socket.join(id);
      player2Socket.join(id);

      //Emit startGame event.  Client will draw board
      //player 1 is always white, player 2 is always black
      player1Socket.emit('startGame', {
         gameId: id,
         color: 'white'
      });

      player2Socket.emit('startGame', {
         gameId: id,
         color: 'black'
      });

      return id;
   }

   GameRoomManager.prototype.runMove = function(id, color, pgnMove){
      var room = this.games[id];
      var game = room.game;
      var erMsg;
      if((erMsg = game.validateMove(pgnMove, color)).valid){
         game.processMove(pgnMove, color);
         console.log('clean move broadcasting')
         this.iosockets.in(id).emit('newMove', {
            color: color,
            pgnMove: pgnMove
         });
      }else if(color === 'white'){
         room.player1.emit('badMove', {
            pgnMove: pgnMove,
            msg: erMsg.desc,
            rollBack: game
         });
      }else if(color === 'black'){
         room.player2.emit('badMove',{
            pgnMove: pgnMove,
            msg: erMsg.desc,
            rollBack: game
         });
      }
   }


   GameRoomManager.prototype.generateId = function(){
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i = 0; i < 50; i++ ){
         text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      if(!this.games[text]){
         return text;
      }else{
         return this.generateId(); //recurse and get a new random id..I never expect this to get hit
      }
   }

   GameRoomManager.prototype.destroyRoom = function(id){
      this.iosockets.in(id).emit('closingRoom');
      this.games[id] = null;
   }

   GameRoomManager.prototype.playerDisconnected = function(playerSocket){
      //check if the player was waiting
     if(this.waiting[playerSocket.id]){
        this.disconnected[playerSocket.id] = playerSocket; //delete in interval to avoid concurrency issues
     }else{//the player was in a game
        //find the game

     }
   }
   return GameRoomManager;
});
