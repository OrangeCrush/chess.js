/*
 * [0][0] will correspond to 1A (White Perspective)
 * [7][7] will then correspond to 8H
 */
function Board(init){
   this.clearBoard();
}

Board.prototype.clearBoard = function(){
   this.squares = new Array(8);
   for(var i = 0 ; i < 8; i++){
      this.squares[i] = new Array(8);
      for(var j = 0; j < 8; j++){
         this.squares[i][j] = {
            occupied: false,
            piece: null
         };              
      }
   }
}

Board.prototype.newGame = function(){
   this.clearBoard();
}

Board.prototype.toString = function(){
   var rval = '\n';
   for(var i = 0; i < 8; i ++){
      for(var j = 0; j < 8; j++){
         if(this.squares[i][j].piece){
            rval += this.squares[i][j].piece.toString() + ' ';
         }else{
            rval += ' ';
         }
      }
      rval += '\n';
   }
   return rval;
}


/*
 * The big daddy.  Process a move.
 *
 * Return true or false-> whether or not the move is allowed.
 * the change is made only if the function returns true.
 */
Board.prototype.processMove = function(pgn){
   if(!isPGNCastle(pgn)){
      var spot_from = pgn.match(/([a-z0-9]+)[x-]/i)[1]
      if(isPieceAtPGNsqr.call(this, spot_from)){

      }
      else{
         if(canCastle(pgn)){

         }
      }
   }
}
