/*
 * EcmaScript 5+ inhertience
 */
function extend(parent, child){
   child.prototype = Object.create(parent.prototype);
   child.prototype.constructor = child;
}

/*
 * Checks if space.x and space.y are on the chess board
 */
function onBoard(space){
  return (0 <= space.x && space.x <= 7) && (0 <= space.y && space.y <= 7);
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


function pgnSqrToCoords(pgnSqr){
   return {
      x: pgnSqr[pgnSqr.length - 2].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0),
      y: +pgnSqr[pgnSqr.length - 1] - 1
   }
}

function errMsg(code, msg, loc){
   return {
      errCode: code,
      message: msg,
      location: 'In: ' + loc
   }
}

