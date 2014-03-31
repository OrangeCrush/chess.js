/*
 * [0][0] will correspond to 1A (White Perspective)
 * [7][7] will then correspond to 8H
 */
function Board(init){
   this.clearBoard();
}

Board.prototype.clearBoard = function(){
   this.board = new Array(8);
   for(var i = 0 ; i < 8; i++){
      this.board[i] = new Array(8);
   }
}

Board.prototype.newGame = function(){
   this.clearBoard();

   for(var i = 0; i < 8; i++){
      //White
      this.board[0][i] = buildPieceByCol(i, {xpos: i, ypos: 0});
      this.board[1][i] = new Piece({xpos:i, ypos:1});

      //Black
      this.board[6][i] = new Piece({xpos:i, ypos:6});
      this.board[7][i] = buildPieceByCol(i, {xpos: i, ypos: 7});
   }
}

Board.prototype.toString = function(){
   var rval = '';
   for(var i=0; i < 8; i ++){
      for(var j = 0; j < 8; j++){
         if(this.board[i][j]){
            rval += this.board[i][j].toString() + ' ';
         }else{
            rval += ' ';
         }
      }
      rval += '\n';
   }
   return rval;
}

function buildPieceByCol(col, init){
   switch(col){
      case 0:
      case 7:
         return new Rook(init);
      case 1:
      case 6:
         return new Knight(init);
      case 2:
      case 5:
         return new Bishop(init);
      case 3:
         return new Queen(init);
      case 4:
         return new King(init);
   }
}

var lol = new Board();
lol.newGame();

console.log(lol.toString())
