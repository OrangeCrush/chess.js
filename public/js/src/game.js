function Game(){
   this.board = new Board();
   this.white = [];
   this.black = [];

   this.blackKing = null;
   this.whiteKing = null;

   this.blackCheck = false;
   this.whiteCheck = false;

   this.turn = 'white';
   this.whiteCastle = false;
   this.blackCastle = false;

   this.newGame();
}

Game.prototype.newGame = function(){
   this.black = [];
   this.white = [];
   for(var i = 0; i < 8; i++){

      var b1 = buildPieceByCol(i, {xpos: i, ypos: 7});
      var b0 = new Piece({xpos:i, ypos:6});

      var w1 = new Piece({xpos:i, ypos:1});
      var w0 = buildPieceByCol(i, {xpos: i, ypos: 0});

      this.white.push(w0);
      this.white.push(w1);
      this.black.push(b0);
      this.black.push(b1);

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
 */
Game.prototype.validateMove = function(pgnMove, team){
   try{
      if(pgnMove === 'O-O-O' || pgnMove === 'O-O'){
         return canCastle();
      }
      var sqr_from = pgnSqrToCoords(spot_from);
      spots = pgnMove.split(/[x-]/i);
      spot_from = spot[0];
      spot_to = spot[1];

      //Validate the move is on the board
      if(onBoard(pgnSqrToCoords(spot_from)) && onBoard(pgnSqrToCoords(spot_to))){
         //Check that there is a piece at the sqr you are moving from
         if(this.board.squaress[sqr_from.x][sqr_from.y].occupied){
            is_capture = pgnMove.indexOf('x');
         }else{
            return false;
         }
      }else{
         return false;
      }
   }catch(ex){
      return false;
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
   if(pgn !== 'O-O-O' || pgn !== 'O-O'){
      var spots = pgn.split(/[x-]/i);
      var coord_from = pgnSqrToCoords(spots[0]);
      var coord_to = pgnSqrToCoords(spots[1]);

      var sqr_from = this.board.squares[coord_from.x][coord_from.y];
      var sqr_to   = this.board.squares[coord_to.x][coord_to.y];

      this.movePiece(sqr_from, sqr_to);

   }else{//castle move
      if(team === 'black'){
         this.blackCastle = false;      
         //..left off here TODO
      }else{
         this.whiteCastle = false;      
      }
   }
}

/*
 * Just copy things over.
 * Do a shallow copy on the piece.
 * Update things
 */
Game.prototype.movePiece = function(sqr_from, sqr_to){
      sqr_to.piece = sqr_from.piece;
      sqr_to.occupied = true;

      sqr_to.piece.initialPos = false;
      sqr_to.piece.xpos  = sqr_to.x;
      sqr_to.piece.ypos  = sqr_to.y;

      sqr_from.piece = null;
      sqr_from.occupied = false;
}
