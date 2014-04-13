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
            piece: null,
            x: i,
            y: j
         };              
      }
   }
}

Board.prototype.newGame = function(){
   this.clearBoard();
}

Board.prototype.toString = function(){
   var rval = '\n';
   for(var i = 7; i >= 0; i--){
      for(var j = 0; j < 8; j++){
         if(this.squares[j][i].occupied){
            rval += this.squares[j][i].piece.toString() + ' ';
         }else{
            rval += '  ';
         }
      }
      rval += '\n';
   }
   return rval;
}
