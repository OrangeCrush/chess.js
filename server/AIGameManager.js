if(typeof define !== 'function'){
   var define = require('amdefine')(module);
}
define(function(require, exports, module){
   var Game = require('Game');
   var Utils = require('Utils');
   var RandomAI = require('RandomAI');
   var CapturerAI = require('CapturerAI');

   function AIGameManager(init) {
     this.games = {};
   }

   AIGameManager.prototype.setupNewGame = function(playerTeam, ai){
     var id = this.getId();
     var aiType;
     if(ai == 'random'){
       aiType = new RandomAI();
     } else if(ai == 'capturer'){
       aiType = new CapturerAI();
     } else {
       throw "Unkown AI type.";
     }
     this.games[id] = {
        game: new Game({}),
        playerTeam: playerTeam,
        aiTeam: Utils.otherTeam(playerTeam),
        ai: aiType
     }
     return id;
   }

   AIGameManager.prototype.getGame = function(id) {
     return this.games[id].game;
   }

   // Process the player's move, process the move
   // Get the Computers move, and process the pgn
   //
   AIGameManager.prototype.processMove = function(id, pgnMove) {
     console.log("Processing move " + pgnMove + " for game " + id);
     if(!this.games[id].game.isGameOver()){
       this.games[id].game.processMove(pgnMove, this.games[id].playerTeam);
       if(!this.games[id].game.isGameOver()){
         var cpuMove = this.games[id].ai.getNextMove(this.games[id].game, Utils.otherTeam(this.games[id].playerTeam));
         this.games[id].game.processMove(cpuMove, Utils.otherTeam(this.games[id].playerTeam));
       }
     } 

     return {
        'cpuMove': cpuMove,
        'color'  : this.games[id].aiTeam
     };
   }

   // Get unique ids
   AIGameManager.prototype.getId = function() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i = 0; i < 50; i++ ){
         text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      if(!(text in this.games)){
         return text;
      }else{
         return this.generateId(); 
      }
   }

  return AIGameManager;

});
