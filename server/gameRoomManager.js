if(typeof define !== 'function'){
   var define = require('amdefine')(module);
}
define(function(require, exports, module){
   var Game = require('Game');
   var Utils = require('Utils');
   //map from game ids to game objects currently being player

   /*
    * This class is primarily responsible for the management of
    * player sockets as well as game validation and setting up
    */
   function GameRoomManager(init){
      /* this.games manages games on the server
       * {
       *    GameID:{
       *       game: [Game object],
       *       player1: [Socket object],
       *       player2: [Socket object]
       *    },...
       * }
       */
      this.games = {};

      /* this.waiting manages the players waiting for a match
       * {
       *    socketId:[Socket Object]
       * }
       */
      this.waiting = {};

      /* this.disconnected is a placeholder for those who disconnected while in this.waiting
       * {
       *    socketId:[Socket Object]
       * }
       */
      this.disconnected = {};

      //All sockets (for broadcasting to rooms)
      this.iosockets = init.iosockets;
      this.ioclients = init.ioclients;
   }

   /*
    * Queue up waiting player's sockets.
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
      var self = this;
      var id = this.generateId();
      this.games[id] = {
         game: new Game({
            timed: true,               //TODO need a way to pass options
            delayTime: 5,
            startTime : 15,
            timeUpHandler : function(timeUpTeam){
               self.sendEndgame(id, Utils.otherTeam(timeUpTeam), timeUpTeam + ' has run out of time to submit a move,' + Utils.otherTeam(timeUpTeam) +  ' wins!', 'timeout');
            }
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

   /*
    * Modify the server's game object and push out messages to
    * the players websockets
    */
   GameRoomManager.prototype.runMove = function(id, color, pgnMove){
      var room = this.games[id];
      var game = room.game;
      var moveResult = game.validateMove(pgnMove, color);
      if(game.whiteCheckMate || game.blackCheckMate){
         var winningColor = game.whiteCheckMate ? 'White' : 'Black';
         this.sendEndgame(id, winningColor.toLowerCase(), winningColor + ' has forced checkmate and won the game!', 'checkmate');
      }else if(moveResult.valid){
         game.processMove(pgnMove, color);
         console.log('clean move broadcasting')
         this.iosockets.in(id).emit('newMove', {
            color: color,
            pgnMove: pgnMove
         });
      }else if(!moveResult.valid && game.timed){//check if time is out for either side
         if(game.sc.timer.whiteTime <= 0){
            console.log('white timeout');
            this.sendEndgame(id, 'black', 'White has run out of time to submit a move, Black wins!', 'timeout');
         }else if(game.sc.timer.blackTime <= 0){
            console.log('black timeout');
            this.sendEndgame(id, 'black', 'White has run out of time to submit a move, Black wins!', 'timeout');
         }
      }else{//bad move; push out a message with a new game object (no timer) and force a client side redraw
         
      }
      
   }

   /*
    * Helper to end the game
    * winner :: /black|white/
    * msg :: message to be sent
    * type :: /checkmate|timeout/
    */
   GameRoomManager.prototype.sendEndgame = function(roomId, winner, msg, type){
      this.iosockets.in(roomId).emit('gameOver',{
         winner: winner,
         msg: msg,
         type: type
      });
      this.destroyRoom(roomId);
   }


   /*
    * Generate a unique id for a game.
    */
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

   /*
    * Free up memory for game <id>
    */
   GameRoomManager.prototype.destroyRoom = function(id){
      this.games[id] = null;
   }

   /*
    * Logic to handle when a player's websocket connection
    * goes bad.  If not in a game, remove from waiting queue, 
    * otherwise see if the game has been up for long enough 
    */
   GameRoomManager.prototype.playerDisconnected = function(playerSocket){
      //check if the player was waiting
     if(this.waiting[playerSocket.id]){
        this.disconnected[playerSocket.id] = playerSocket; //delete in interval to avoid concurrency issues
     }else{//the player was in a game, end it with the other playing winning 
        //find the game

     }
   }
   return GameRoomManager;
});
