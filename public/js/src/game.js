function Game(){
   this.board = new Board();
   this.black = this.white = [];
   this.blackKing = this.whiteKing = null;
}

Game.prototype.newGame = function(){
   this.black = this.white = [];
   for(var i = 0; i < 8; i++){

      var b1 = buildPieceByCol(i, {xpos: i, ypos: 7});
      var b0 = new Piece({xpos:i, ypos:6});

      var w1 = new Piece({xpos:i, ypos:1});
      var w0 = buildPieceByCol(i, {xpos: i, ypos: 0});

      this.white.push(w0);
      this.white.push(w1);
      this.black.push(b0);
      this.black.push(b1);

      this.board.squares[0][i] = {occupied: true, piece: w0}; 
      this.board.squares[1][i] = {occupied: true, piece: w1};
      this.board.squares[6][i] = {occupied: true, piece: b0};
      this.board.squares[7][i] = {occupied: true, piece: b1};

      if(w0.toString() === 'K')
         this.whiteKing = w0;
      if(b1.toString() === 'K')
         this.blackKing = b1;
   }
}

Game.prototype.validateMove = function(pngMove){

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

function isPieceAtPGNsqr(spot){
   var piece_type = spot[0];
   var board_column = letters[spot[1]];
   var board_row = +spot[2] - 1;
   var piece_from = this.board.squares[board_row][board_column];

   // Check if the piece is what it says it is
   return piece_from.name === piece_type;
}

function isPGNCastle(pgn){
   return pgn === 'O-O-O' || pgn === 'O-O';
}

function canPieceMoveTo(piece, dest){
   
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
