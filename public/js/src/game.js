function Game(){
   this.board = new Board();
   this.teamTurn = ['white', 'black'];
   this.newGame();
}


Game.prototype.newGame = function(){
   this.board = new Board();

   this.turnCount = 0;
   this.blackKing = null;
   this.whiteKing = null;

   this.black = [];
   this.white = [];
   this.blackCheck = false;
   this.whiteCheck = false;

   this.turn = 'white';
   this.whiteCastle = true;
   this.blackCastle = true;

   for(var i = 0; i < 8; i++){

      var b1 = buildPieceByCol(i, {xpos: i, ypos: 7});
      var b0 = new Piece({xpos:i, ypos:6});

      var w1 = new Piece({xpos:i, ypos:1});
      var w0 = buildPieceByCol(i, {xpos: i, ypos: 0});

      this.white.push(w0, w1);
      this.black.push(b0, b1);

      this.board.squares[i][0].occupied = true;
      this.board.squares[i][1].occupied = true;
      this.board.squares[i][6].occupied = true;
      this.board.squares[i][7].occupied = true;

      this.board.squares[i][0].piece = w0; 
      this.board.squares[i][1].piece = w1;
      this.board.squares[i][6].piece = b0;
      this.board.squares[i][7].piece = b1;

      if(w0.toString() === 'K')
         this.whiteKing = w0;
      if(b1.toString() === 'K')
         this.blackKing = b1;
   }
}

/*
 * validates a chess move based on the state of the game.
 * Accepts moves in Portable Game Notation.
 * team ::= /(black|white)/
 *
 * returns ::= {
 *    valid: t/f,
 *    desc: "why"
 * }
 */
Game.prototype.validateMove = function(pgnMove, team){
   try{
      if(pgnMove === 'O-O-O' || pgnMove === 'O-O'){
         return {valid: canCastle(), desc:'Based on canCastle'};
      }
      var spots = pgnMove.split(/[x-]/i);
      var spot_from = pgnSqrToCoords(spots[0]);
      var spot_to = pgnSqrToCoords(spots[1]);

      //Validate the move is on the board
      if(onBoard(spot_from) && onBoard(spot_to)){
         //Check that there is a piece at the sqr you are moving from
         if(this.board.squares[spot_from.x][spot_from.y].occupied){
            var piece = this.getPieceFromCoord(spot_from.x, spot_from.y);
            var moveSquares = this.getMoveSquaresForPiece(piece, team);
            if(isSqrInAry(moveSquares, spot_to)){
               return {valid: true, desc:'Go for it kid'}; //As long as moveSqrs fns handle check i think this is O.K.
            }else{
               return {valid: false, desc:"Move wasn't in moveSquares."};
            }
         }else{
            return {valid: false, desc:'No piece where you started'}
         }
      }else{
         return {valid: false, desc: 'Move not on board'}
      }
   }catch(ex){
      return {valid: false, desc: 'Exception: \n' + ex.message}
   }
}

/*
 * Checks if team can castle
 * There are a number of cases when castling is not permitted.
 *   [x] Your king has been moved earlier in the game.
 *   [x] The rook that castles has been moved earlier in the game.
 *   [x] There are pieces standing between your king and rook.
 *   [x] The king is in check.
 *   [_] The king moves through a square that is attacked by a piece of the opponent.
 *   [_] The king would be in check after castling.
 *   http://www.chessvariants.org/d.chess/castlefaq.html
 */
Game.prototype.canCastle = function(pgn, team){
   var king, rook, canCastle;
   if(team === 'black'){
      king = this.blackKing;
      canCastle = this.blackCastle;
   }else if(team == 'white'){
      king = this.whiteKing;
      canCastle = this.whiteCastle;
   }else{
      throw 'Team passed to canCastle does not match /(black|white)/';
   }
   if(king.initialPos && canCastle){
      if(pgn === 'O-O-O'){ //Queenside
         if(team === 'black'){
            rook = this.board.squares[0][7].piece;
            return rook.initialPos && !this.blackCheck &&
               !this.board.squares[1][7].occupied &&
               !this.board.squares[2][7].occupied &&
               !this.board.squares[3][7].occupied;
         }else{
            rook = this.board.squares[0][0].piece;
            return rook.initialPos && !this.whiteCheck && 
               !this.board.squares[1][0].occupied &&
               !this.board.squares[2][0].occupied &&
               !this.board.squares[3][0].occupied;
         }
      }else if(pgn === 'O-O'){ //Kingside
         if(team === 'black'){
            rook = this.board.squares[7][7].piece;
            return rook.initialPos && !this.blackCheck &&
               !this.board.squares[6][7].occupied &&
               !this.board.squares[5][7].occupied;
         }else{
            rook = this.board.squares[7][0].piece;
            return rook.initialPos && !this.whiteCheck &&
               !this.board.squares[6][0].occupied &&
               !this.board.squares[5][0].occupied;
         }
      }else{
         throw 'PGN not valid in canCastle';
      }
   }else{
      return false; //king has moved
   }
}

/*
 * Changes the state of a game (After validation..)
 * Assume validation has passed already
 */
Game.prototype.processMove = function(pgn, team){
   var captured;
   if(pgn !== 'O-O-O' && pgn !== 'O-O'){
      var spots = pgn.split(/[x-]/i);
      var coord_from = pgnSqrToCoords(spots[0]);
      var coord_to = pgnSqrToCoords(spots[1]);

      var sqr_from = this.board.squares[coord_from.x][coord_from.y];
      var sqr_to   = this.board.squares[coord_to.x][coord_to.y];

      captured = this.movePiece(sqr_from, sqr_to);

   }else{//castle move
      var king, rook_sqr;
      if(team === 'black'){
         this.blackCastle = false;      
         king = this.blackKing;
         rook_sqr = pgn === 'O-O-O' ? this.board.squares[0][7] : this.board.squares[7][7];
      }else{
         this.whiteCastle = false;      
         king = this.whiteKing;
         rook_sqr = pgn === 'O-O-O' ? this.board.squares[0][0] : this.board.squares[7][0];
      }
      king_sqr = this.getSqrForPiece(king);
      this.swapPiece(king_sqr, rook_sqr);
   }

   this.turn = this.teamTurn[++this.turnCount % 2];
   return captured;
}

/*
 * Just copy things over.
 * Do a shallow copy on the piece.
 * Update things
 * returns the piece that was destroyed (null if not)
 */
Game.prototype.movePiece = function(sqr_from, sqr_to){
      var captured = sqr_to.piece;
      sqr_to.piece = sqr_from.piece;
      sqr_to.occupied = true;

      sqr_to.piece.initialPos = false;
      sqr_to.piece.xpos  = sqr_to.x;
      sqr_to.piece.ypos  = sqr_to.y;

      sqr_from.piece = null;
      sqr_from.occupied = false;
      return captured;
}

/*
 * Basically needed for catling.
 * TODO LMAO this is not how you castle wtf was i thinking
 */
Game.prototype.swapPiece = function(sqr1, sqr2){
   var temp = sqr1.piece;
   sqr1.piece = sqr2.piece;
   sqr2.piece = temp;

   sqr2.piece.initialPos = sqr1.piece.initialPos = false;
}


/*
 * Returns a set of moves that could be made by a piece
 * [x] Filters on Pieces in the way
 * [x] Filters on Squares off the board
 * [_] Filters on Check
 * [_] Filters on Checkmate
 * [_] Filters on Pieces that block Checkmate
 * [_] Adds Castling Moves
 */
Game.prototype.getMoveSquaresForPiece = function(piece, team){
   var squares = [];
   var x = piece.xpos;
   var y = piece.ypos;
   switch(piece.name){
      case 'P':
         var teamFactor = team === 'black' ? -1 : 1;
         if(!this.board.squares[x][y + 1 * teamFactor].occupied){
            squares.push(this.board.squares[x][y + 1 * teamFactor])
         }

         //check the diagonals for a capture
         if(this.board.squares[x + 1][y + 1 * teamFactor].occupied){
            squares.push(this.board.squares[x][y + 1 * teamFactor])
         }

         if(this.board.squares[x - 1][y + 1 * teamFactor].occupied){
            squares.push(this.board.squares[x][y + 1 * teamFactor])
         }

         //If the pawn hasn't moved yet, let it move two
         if(piece.initialPos && !this.board.squares[x][y + 2 * teamFactor].occupied){
            squares.push(this.board.squares[x][y + 2 * teamFactor])
         }
      break;
      case 'R':
         squares = this.marchUntilPiece(piece, {up_down: true, diag: false}, 8);
      break;
      case 'B':
         squares = this.marchUntilPiece(piece, {up_down: false, diag: true}, 8);
      break;
      case 'N':
         squares.push(this.board.squares[x + 2][y + 1]);
         squares.push(this.board.squares[x + 2][y - 1]);
         squares.push(this.board.squares[x - 2][y + 1]);
         squares.push(this.board.squares[x - 2][y - 1]);
         squares.push(this.board.squares[x + 1][y + 2]);
         squares.push(this.board.squares[x + 1][y - 2]);
         squares.push(this.board.squares[x - 1][y + 2]);
         squares.push(this.board.squares[x - 1][y - 2]);
      break;
      case 'K':
         squares = this.marchUntilPiece(piece, {up_down: true, diag: true}, 1);
      break;
      case 'Q':
         squares = this.marchUntilPiece(piece, {up_down: true, diag: true}, 8);
      break;

   }
   return squares.filter(onBoard);
}

/*
 * Returns an array of pieces that are
 * in the specified direction and not occupied 
 * for n squares
 * direction ::= {
 *    up_down: t/f
 *    diag: t/f
 * }
 */
Game.prototype.marchUntilPiece = function(piece, direction, n){
   squares = [];
   var x = piece.xpos;
   var y = piece.ypos;
   if(direction.up_down){
      //March Right
      for(var i = 1; i <= n && onBoard({x: x + i, y:y}) && !this.board.squares[x + i][y].occupied; i++){
         squares.push(this.board.squares[x + i][y]);
      }
      //March Left
      for(var i = 1; i <= n && onBoard({x: x - i, y:y}) && !this.board.squares[x - i][y].occupied; i++){
         squares.push(this.board.squares[x - i][y]);
      }
      //March Up
      for(var i = 1; i < n && onBoard({x: x, y: y + i}) && !this.board.squares[x][y + i].occupied; i++){
         squares.push(this.board.squares[x][y + i]);
      }
      //March Down
      for(var i = 1; i <= n && onBoard({x: x, y: y - i}) && !this.board.squares[x][y - i].occupied; i++){
         squares.push(this.board.squares[x][y - i]);
      }
   }
   if(direction.diag){
      //March Up-Right
      for(var i = 1; i <= n && onBoard({x: x + i, y: y + i}) && !this.board.squares[x + i][y + i].occupied; i++){
         squares.push(this.board.squares[x + i][y + i]);
      }
      //March Up-Left
      for(var i = 1; i <= n && onBoard({x: x - i, y: y + i}) && !this.board.squares[x - i][y + i].occupied; i++){
         squares.push(this.board.squares[x - i][y + i]);
      }
      //March Down-Left
      for(var i = 1; i <= n && onBoard({x: x - i, y: y - i}) && !this.board.squares[x - i][y - i].occupied; i++){
         squares.push(this.board.squares[x - i][y - i]);
      }
      //March Down-Right
      for(var i = 1; i <= n && onBoard({x: x + i, y: y - i}) && !this.board.squares[x + i][y - i].occupied; i++){
         squares.push(this.board.squares[x + i][y - i]);
      }
   }
   return squares;
}


Game.prototype.getSqrForPiece = function(piece){
   return this.board.squares[piece.xpos][piece.ypos];
}

Game.prototype.getPieceFromCoord = function(x,y){
   return this.board.squares[x][y].piece;
}
