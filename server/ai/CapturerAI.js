if(typeof define !== 'function'){
   var define = require('amdefine')(module);
}
define(function(require, exports, module){
  var Utils = require('Utils');

  function CapturerAI(init) {
  }

  CapturerAI.prototype.getNextMove = function(game, cpuTeamColor) {
     var allMoves   = [];
     var pgnMoves   = [];
     var smartMoves = [];

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

         pgnMove = Utils.coordsToPgnSqr(curX,curY) + '-' + Utils.coordsToPgnSqr(newX, newY);
         pgnMoves.push(pgnMove);

         /*
          * Store what moves would capture or result in check / checkmate
          * {
          *    pgnMove  : e6-e8
          *    captures : 'Q'
          *    check    : true
          * }, ...
          */
         console.log("CALLING RESULTS IN CHECK");
         smartMoves.push({
           pgnMove   : pgnMove,
           captures  : game.whatWouldMoveCapture(pgnMove),
           check     : game.moveResultsInCheck(allMoves[i].piece, {x: newX, y: newY}, Utils.otherTeam(cpuTeamColor), true),
           //checkMate : game.moveResultsInCheckMate(allMoves[i].piece, {x: newX, y: newY}, cpuTeamColor)
         });
       }
     }

     console.log("Dumping SmartMoves");
     console.log(smartMoves);

     // Check if we can force checkmate
     //var checkMateMove;
     //if((checkMateMove = smartMoves.filter(function(x){ return x.checkMate}))[0]){
     //  console.log("Found checkmateMove!");
     //  return checkMateMove.pgnMove;
     //}

     // Check if we can force check
     var checkMove;
     if((checkMove = smartMoves.filter(function(x){ return x.check}))[0]){
       console.log("Found checkMove!");
       console.log(checkMove);
       return checkMove[0].pgnMove;
     }

     // Check what we can capture
     if(smartMoves.filter(function(x){ return x.captures }).length > 0){
       if(smartMoves.filter(function(x){ return x.captures == 'Q'}).length > 0){
         return smartMoves.filter(function(x){ return x.captures == 'Q'})[0].pgnMove;
       } else if(smartMoves.filter(function(x){ return x.captures == 'R'}).length > 0) {
         return smartMoves.filter(function(x){ return x.captures == 'R'})[0].pgnMove;
       } else if(smartMoves.filter(function(x){ return x.captures == 'B'}).length > 0) {
         return smartMoves.filter(function(x){ return x.captures == 'B'})[0].pgnMove;
       } else if(smartMoves.filter(function(x){ return x.captures == 'N'}).length > 0) {
         return smartMoves.filter(function(x){ return x.captures == 'N'})[0].pgnMove;
       }
     }

     // Pick a random valid move
     return pgnMoves[Math.floor(Math.random() * pgnMoves.length)];
  }

  return CapturerAI;
});
