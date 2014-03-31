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
   this.white = {};
   this.white = {};
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
   var rval = '\n';
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

function isPieceAtPGNsqr(spot){
   var piece_type = spot[0];
   var board_column = letters[spot[1]];
   var board_row = +spot[2] - 1;
   var piece_from = this.board[board_row][board_column];

   // Check if the piece is what it says it is
   return piece_from.name === piece_type;
}

function isPGNCastle(pgn){
   return pgn === 'O-O-O' || pgn === 'O-O';
}

function canPieceMoveTo(piece, dest){
   
}

function isPieceBlockedFromSqr(){

}

function isCheck(){

}

function isCheckMate(){

}

/*
*
*/
function canCastle(pgn){

}

var letters = {
   a:0,
   b:1,
   c:2,
   d:3,
   e:4,
   f:5,
   g:6,
   h:7
}

var b = new Board();
b.newGame();
console.log(b.toString());
