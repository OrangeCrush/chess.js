if(typeof define !== 'function'){
   var define = require('amdefine')(module);
}
define(function(require, exports, module){
  var Utils = require('Utils');

  function RandomAI(init) {
  }

  RandomAI.prototype.getNextMove = function(game, cpuTeamColor) {
     var allMoves = [];
     var pgnMoves = [];

     game.allMovesForTeam(cpuTeamColor, function(piece, moves) {
       allMoves.push({
         piece: piece,
         moves: moves,
       });
     });

     for(var i = 0; i < allMoves.length; i++){
       for(var j = 0; j < allMoves[i].moves.length; j++){
         var curX = allMoves[i].piece.xpos;
         var curY = allMoves[i].piece.ypos;

         var newX = allMoves[i].moves[j].x;
         var newY = allMoves[i].moves[j].y;

         pgnMoves.push(Utils.coordsToPgnSqr(curX,curY) + '-' + Utils.coordsToPgnSqr(newX, newY));
       }
     }

     return pgnMoves[Math.floor(Math.random() * pgnMoves.length)];
  }

  return RandomAI;
});
