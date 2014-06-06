if(typeof define !== 'function'){
   var define = require('amdefine')(module);
}
define(function(require, exports, module){
   var Pieces = require('Piece')();
   var Board = require('Board')();
   var Utils = require('Utils');

   function Game(init){
      this.promote = (init && init.promote) || function(piece){ piece.name = 'Q'; }; //Pass in a function to promote pawns
      this.newGame();
   }

   Game.prototype.newGame = function(){
      this.board = new Board();

      this.turnCount = 0;
      this.moves = [];

      this.blackKing = null;
      this.whiteKing = null;

      this.black = [];
      this.white = [];
      this.blackCheck = false;
      this.whiteCheck = false;

      this.turn = 'white';
      this.whiteCastle = true;
      this.blackCastle = true;

      //Used for validating pgn basically true for 1 turn after a promotion
      this.whitePromotion = false;
      this.blackPromotion = false;

      this.whiteCaptured = [];
      this.blackCaptured = [];

      for(var i = 0; i < 8; i++){

         var b1 = this.buildPieceByCol(i, {xpos: i, ypos: 7, color: 'black'});
         var b0 = new Pieces.Piece({xpos:i, ypos:6, color: 'black'});

         var w1 = new Pieces.Piece({xpos:i, ypos:1, color: 'white'});
         var w0 = this.buildPieceByCol(i, {xpos: i, ypos: 0, color: 'white'});

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

         if(w0.name === 'K')
            this.whiteKing = w0;
         if(b1.name === 'K')
            this.blackKing = b1;
      }
   }

   Game.prototype.buildPieceByCol = function(col, init){
      switch(col){
         case 0:
            case 7:
            return new Pieces.Rook(init);
         case 1:
            case 6:
            return new Pieces.Knight(init);
         case 2:
            case 5:
            return new Pieces.Bishop(init);
         case 3:
            return new Pieces.Queen(init);
         case 4:
            return new Pieces.King(init);
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
         if(team === this.turn ){
            if(pgnMove === 'O-O-O' || pgnMove === 'O-O'){
               var valid = this.canCastle(pgnMove, team);
               return {valid: valid, desc: valid ? 'Nice Castle; man.' : 'Can Not Castle'};
            }
            var spots = pgnMove.split(/[x-]/i);
            var spot_from = Utils.pgnSqrToCoords(spots[0]);
            var spot_to = Utils.pgnSqrToCoords(spots[1]);

            //Validate the move is on the board
            if(Utils.onBoard(spot_from) && Utils.onBoard(spot_to)){
               //Check that there is a piece at the sqr you are moving from
               if(this.board.squares[spot_from.x][spot_from.y].occupied){
                  var piece = this.getPieceFromCoord(spot_from.x, spot_from.y);
                  if(piece.color === this.turn){
                     var moveSquares = this.getMoveSquaresForPiece(piece, team);
                     if(Utils.isSqrInAry(moveSquares, spot_to)){
                        if(!this.moveResultsInCheck(piece, this.board.squares[spot_to.x][spot_to.y], team)){
                           return {valid: true, desc:'Go for it kid'}; //As long as moveSqrs fns handle check i think this is O.K.
                        }else{
                           return {valid: false, desc:"Move would result in check for " + Utils.otherTeam(team)};
                        }
                     }else{
                        return {valid: false, desc:"Move wasn't in moveSquares."};
                     }
                  }else{
                     return {valid: false, desc:'The piece moved belongs to the other team.'};
                  }
               }else{
                  return {valid: false, desc:'No piece where you started'};
               }
            }else{
               return {valid: false, desc: 'Move not on board'};
            }
         }else{
            return {valid: false, desc: "It's not " + team  + "'s move."};
         }
      }catch(ex){
         return {valid: false, desc: 'Exception: \n' + ex.message};
      }
   }

   /*
    * Checks if team can castle
    * There are a number of cases when castling is not permitted.
    *   [x] Your king has been moved earlier in the game.
    *   [x] The rook that castles has been moved earlier in the game.
    *   [x] There are pieces standing between your king and rook.
    *   [x] The king is in check.
    *   [x] The king moves through a square that is attacked by a piece of the opponent.
    *   [x] The king would be in check after castling.
    *   http://www.chessvariants.org/d.chess/castlefaq.html
    */
   Game.prototype.canCastle = function(pgn, team){
      var king, rook, canCastle;
      if(team === 'black'){
         king = this.blackKing;
         canCastle = this.blackCastle && !this.blackCheck;
      }else if(team === 'white'){
         king = this.whiteKing;
         canCastle = this.whiteCastle && !this.whiteCheck;
      }else{
         throw 'Team passed to canCastle does not match /(black|white)/';
      }
      if(king.initialPos && canCastle){
         if(pgn === 'O-O-O'){ //Queenside
            if(team === 'black'){
               rook = this.board.squares[0][7].piece;
               return rook && rook.initialPos && !this.blackCheck &&
                  !this.board.squares[1][7].occupied && 
                  !this.board.squares[2][7].occupied && !this.moveResultsInCheck(king, this.board.squares[2][7], team) &&
                  !this.board.squares[3][7].occupied && !this.moveResultsInCheck(king, this.board.squares[3][7], team);
            }else{
               rook = this.board.squares[0][0].piece;
               return rook && rook.initialPos && !this.whiteCheck && 
                  !this.board.squares[1][0].occupied && 
                  !this.board.squares[2][0].occupied && !this.moveResultsInCheck(king, this.board.squares[2][0], team) &&
                  !this.board.squares[3][0].occupied && !this.moveResultsInCheck(king, this.board.squares[3][0], team);
            }
         }else if(pgn === 'O-O'){ //Kingside
            if(team === 'black'){
               rook = this.board.squares[7][7].piece;
               return rook && rook.initialPos && !this.blackCheck &&
                  !this.board.squares[6][7].occupied && !this.moveResultsInCheck(king, this.board.squares[6][7], team) &&
                  !this.board.squares[5][7].occupied && !this.moveResultsInCheck(king, this.board.squares[5][7], team);
            }else{
               rook = this.board.squares[7][0].piece;
               return rook && rook.initialPos && !this.whiteCheck &&
                  !this.board.squares[6][0].occupied && !this.moveResultsInCheck(king, this.board.squares[6][0], team) &&
                  !this.board.squares[5][0].occupied && !this.moveResultsInCheck(king, this.board.squares[5][0], team);
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
    * Calls this.promote on pawn promotion
    * Appends captured pieces to the coresponding array
    */
   Game.prototype.processMove = function(pgn, team){
      var captured;
      if(pgn !== 'O-O-O' && pgn !== 'O-O'){
         var spots = pgn.split(/[x-]/i);
         var coord_from = Utils.pgnSqrToCoords(spots[0]);
         var coord_to = Utils.pgnSqrToCoords(spots[1]);

         var sqr_from = this.board.squares[coord_from.x][coord_from.y];
         var sqr_to   = this.board.squares[coord_to.x][coord_to.y]; 
         captured = this.movePiece(sqr_from, sqr_to);

         if(captured){
               var capary = team === 'black' ? this.blackCaptured : this.whiteCaptured;
               capary.push(captured);
         }

         if(this.canPromote(sqr_to.piece)){
            this.promote(sqr_to.piece);
            if(team === 'black'){
               this.blackPromotion = true;
            }else{
               this.whitePromotion = true;
            }
         }else{
            this.whitePromotion = this.blackPromotion = false;
         }

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
         var ypos = king.ypos;
         var king_newx = pgn === 'O-O' ? 6 : 2;
         var rook_newx = pgn === 'O-O' ? 5 : 3;

         var rook = rook_sqr.piece;

         this.movePiece(this.getSqrForPiece(king), this.board.squares[king_newx][ypos]);

         rook_sqr.piece = rook; //Re-attach so that movePiece works

         this.movePiece(rook_sqr, this.board.squares[rook_newx][ypos]);

      }

      this.turn = Utils.otherTeam(this.turn);
      this.turnCount++;
      this.moves.push(pgn);

      this.whiteCheck = this.isCheckForTeam('white');
      this.blackCheck = this.isCheckForTeam('black');


      return captured;
   }

   Game.prototype.teamPieces = function(team){
      return team === 'black' ? this.black : this.white;
   }

   /*
    * Just copy things over.
    * Do a shallow copy on the piece.
    * Update things
    * returns the piece that was destroyed (null if not)
    *
    * Also updates this.king, and removes captured piece from the games array
    */
   Game.prototype.movePiece = function(sqr_from, sqr_to){
      var captured = sqr_to.piece;
      sqr_to.piece = sqr_from.piece;
      sqr_to.occupied = true;

      sqr_to.piece.initialPos = false;
      sqr_to.piece.xpos  = sqr_to.x;
      sqr_to.piece.ypos  = sqr_to.y;

      if(sqr_to.piece.name === 'K'){ //Update kings if they were moved.
         if(sqr_to.piece.color === 'white'){
            this.whiteKing = sqr_to.piece;
         }else{
            this.blackKing = sqr_to.piece;
         }
      }

      sqr_from.piece = null;
      sqr_from.occupied = false;

      if(captured != null){ //remove piece from array
         var pieces = Utils.otherTeam(this.turn) === 'black' ? this.black : this.white ;
         if(Utils.otherTeam(this.turn) === 'white'){
            this.white = pieces.filter(function(piece){
               return !piece.equals(captured);
            });
         }else{
            this.black = pieces.filter(function(piece){
               return !piece.equals(captured);
            });
         }
      }

      return captured;
   }


   /*
    * Returns a set of moves that could be made by a piece
    * [x] Filters on Pieces in the way
    * [x] Filters on Squares off the board
    */
   Game.prototype.getMoveSquaresForPiece = function(piece, team){
      var squares = [];
      var x = piece.xpos;
      var y = piece.ypos;
      switch(piece.name){
         case 'P':
            var teamFactor = team === 'black' ? -1 : 1;
         if(Utils.onBoard({x: x, y: y + 1 * teamFactor}) && !this.board.squares[x][y + 1 * teamFactor].occupied){
            squares.push(this.board.squares[x][y + 1 * teamFactor]);
         }

         //check the diagonals for a capture
         if(Utils.onBoard({x: x + 1, y: y + 1 * teamFactor}) && this.board.squares[x + 1][y + 1 * teamFactor].occupied && this.board.squares[x + 1][y + 1 * teamFactor].piece.color !== team){
            squares.push(this.board.squares[x + 1][y + 1 * teamFactor]);
         }

         if(Utils.onBoard({x: x - 1, y: y + 1 * teamFactor}) && this.board.squares[x - 1][y + 1 * teamFactor].occupied && this.board.squares[x - 1][y + 1 * teamFactor].piece.color !== team){
            squares.push(this.board.squares[x - 1][y + 1 * teamFactor]);
         }

         //If the pawn hasn't moved yet, let it move two (and its not blocked!)
         if(piece.initialPos && Utils.onBoard({x:x, y: y + 2 * teamFactor}) && !this.board.squares[x][y + 2 * teamFactor].occupied && !this.board.squares[x][y + 1 * teamFactor].occupied){
            squares.push(this.board.squares[x][y + 2 * teamFactor]);
         }
         break;
         case 'R':
            squares = this.marchUntilPiece(piece, {up_down: true, diag: false}, 8);
         break;
         case 'B':
            squares = this.marchUntilPiece(piece, {up_down: false, diag: true}, 8);
         break;
         case 'N':
            if(Utils.onBoard({x: x + 2, y: y + 1}) && !(this.board.squares[x + 2][y + 1].piece && this.board.squares[x + 2][y + 1].piece.color === team))
         squares.push(this.board.squares[x + 2][y + 1]);
         if(Utils.onBoard({x: x + 2, y: y - 1}) && !(this.board.squares[x + 2][y - 1].piece && this.board.squares[x + 2][y - 1].piece.color === team))
         squares.push(this.board.squares[x + 2][y - 1]);
         if(Utils.onBoard({x: x - 2, y: y + 1}) && !(this.board.squares[x - 2][y + 1].piece && this.board.squares[x - 2][y + 1].piece.color === team))
         squares.push(this.board.squares[x - 2][y + 1]);
         if(Utils.onBoard({x: x - 2, y: y - 1}) && !(this.board.squares[x - 2][y - 1].piece && this.board.squares[x - 2][y - 1].piece.color === team))
         squares.push(this.board.squares[x - 2][y - 1]);
         if(Utils.onBoard({x: x + 1, y: y + 2}) && !(this.board.squares[x + 1][y + 2].piece && this.board.squares[x + 1][y + 2].piece.color === team))
         squares.push(this.board.squares[x + 1][y + 2]);
         if(Utils.onBoard({x: x + 1, y: y - 2}) && !(this.board.squares[x + 1][y - 2].piece && this.board.squares[x + 1][y - 2].piece.color === team))
         squares.push(this.board.squares[x + 1][y - 2]);
         if(Utils.onBoard({x: x - 1, y: y + 2}) && !(this.board.squares[x - 1][y + 2].piece && this.board.squares[x - 1][y + 2].piece.color === team))
         squares.push(this.board.squares[x - 1][y + 2]);
         if(Utils.onBoard({x: x - 1, y: y - 2}) && !(this.board.squares[x - 1][y - 2].piece && this.board.squares[x - 1][y - 2].piece.color === team))
         squares.push(this.board.squares[x - 1][y - 2]);
         break;
         case 'K':
            squares = this.marchUntilPiece(piece, {up_down: true, diag: true}, 1);
         break;
         case 'Q':
            squares = this.marchUntilPiece(piece, {up_down: true, diag: true}, 8);
         break;

      }
      return squares;
   }

   /*
    * Gets the valid moves for a piece.  Useful in interfaces and Ai's
    * Also adds A castle square for the king if he can castle
    * piece | piece
    * x | sqr
    */
   Game.prototype.getValidMovesForPiece = function(piece){
      var game = this;
      var moves = this.getMoveSquaresForPiece(piece, piece.color).filter(function(x){
         return !game.moveResultsInCheck(piece, x, piece.color);
      });

      if(piece.name === 'K'){
         if(this.canCastle('O-O-O', piece.color)){
            //add c1 and c8 for king
            moves.push( piece.color === 'white' ? this.board.squares[2][0] : this.board.squares[2][7]);
         }
         if(this.canCastle('O-O', piece.color)){
            //add g1 and g8 for king
            moves.push( piece.color === 'white' ? this.board.squares[6][0] : this.board.squares[6][7]);
         }
      }

      return moves;
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
      var blocked = false;
      if(direction.up_down){
         //March Right
         for(var i = 1; i <= n && Utils.onBoard({x: x + i, y:y}) && !blocked; i++){
            if(this.board.squares[x + i][y].occupied){
               blocked = true;
            }
            //Make sure we don't include pieces with the same color in the results
            if(!this.board.squares[x + i][y].occupied || this.board.squares[x + i][y].occupied && this.board.squares[x + i][y].piece.color !== piece.color){
               squares.push(this.board.squares[x + i][y]);
            }
         }
         //March Left
         blocked = false;
         for(var i = 1; i <= n && Utils.onBoard({x: x - i, y:y}) && !blocked; i++){
            if(this.board.squares[x - i][y].occupied){ 
               blocked = true;
            }
            if(!this.board.squares[x - i][y].occupied || this.board.squares[x - i][y].occupied && this.board.squares[x - i][y].piece.color !== piece.color){
               squares.push(this.board.squares[x - i][y]);
            }
         }
         //March Up
         blocked = false;
         for(var i = 1; i <= n && Utils.onBoard({x: x, y: y + i}) && !blocked; i++){
            if(this.board.squares[x][y + i].occupied){
               blocked = true;
            }
            if(!this.board.squares[x][y + i].occupied || this.board.squares[x][y + i].occupied && this.board.squares[x][y + i].piece.color !== piece.color){
               squares.push(this.board.squares[x][y + i]);
            }
         }
         //March Down
         blocked = false;
         for(var i = 1; i <= n && Utils.onBoard({x: x, y: y - i}) && !blocked; i++){
            if(this.board.squares[x][y - i].occupied){
               blocked = true;
            }
            if(!this.board.squares[x][y - i].occupied || this.board.squares[x][y - i].occupied && this.board.squares[x][y - i].piece.color !== piece.color){
               squares.push(this.board.squares[x][y - i]);
            }
         }
      }
      if(direction.diag){
         //March Up-Right
         blocked = false;
         for(var i = 1; i <= n && Utils.onBoard({x: x + i, y: y + i}) && !blocked; i++){
            if(this.board.squares[x + i][y + i].occupied){
               blocked = true;
            }
            if(!this.board.squares[x + i][y + i].occupied || this.board.squares[x + i][y + i].occupied && this.board.squares[x + i][y + i].piece.color !== piece.color){
               squares.push(this.board.squares[x + i][y + i]);
            }
         }
         //March Up-Left
         blocked = false;
         for(var i = 1; i <= n && Utils.onBoard({x: x - i, y: y + i}) && !blocked; i++){
            if(this.board.squares[x - i][y + i].occupied){
               blocked = true;
            }
            if(!this.board.squares[x - i][y + i].occupied || this.board.squares[x - i][y + i].occupied && this.board.squares[x - i][y + i].piece.color !== piece.color){
               squares.push(this.board.squares[x - i][y + i]);
            }
         }
         //March Down-Left
         blocked = false;
         for(var i = 1; i <= n && Utils.onBoard({x: x - i, y: y - i}) && !blocked; i++){
            if(this.board.squares[x - i][y - i].occupied){
               blocked = true;
            }
            if(!this.board.squares[x - i][y - i].occupied || this.board.squares[x - i][y - i].occupied && this.board.squares[x - i][y - i].piece.color !== piece.color){
               squares.push(this.board.squares[x - i][y - i]);
            }
         }
         //March Down-Right
         blocked = false;
         for(var i = 1; i <= n && Utils.onBoard({x: x + i, y: y - i}) && !blocked; i++){
            if(this.board.squares[x + i][y - i].occupied){
               blocked = true;
            }
            if(!this.board.squares[x + i][y - i].occupied || this.board.squares[x + i][y - i].occupied && this.board.squares[x + i][y - i].piece.color !== piece.color){
               squares.push(this.board.squares[x + i][y - i]);
            }
         }
      }
      return squares;
   }

   /*
    * Pass two pieces, returns t/f if it piece_atk can attack piece_def
    */
   Game.prototype.canPieceCapture  = function(piece_atk, piece_def){
      return Utils.isSqrInAry(this.getMoveSquaresForPiece(piece_atk, piece_atk.color), this.getSqrForPiece(piece_def));
   }

   /*
    * Predicate to see whether or not team team is in check
    * team ::= /(black|white)/
    */
   Game.prototype.isCheckForTeam = function(team){
      //Get opposite (attacking) team pieces
      var pieces = team === 'white' ? this.black : this.white;
      var king   = team === 'white' ? this.whiteKing : this.blackKing;
      for(var i = 0 ; i < pieces.length; i++){
         if(this.canPieceCapture(pieces[i], king)){
            return true;
         }
      }
      return false;
   }

   /*
    * Make a temp game, move the piece, see if there is check.
    */
   Game.prototype.moveResultsInCheck = function(piece, sqr_move_to, team){
      var future_game = Utils.deepCopyObj(this);
      future_game.movePiece(future_game.getSqrForPiece(piece), future_game.board.squares[sqr_move_to.x][sqr_move_to.y]);
      return future_game.isCheckForTeam(team);
   }

   /*
    * Checks for checkmate in a game..
    * Check each moveSquare of the King, 
    * if he is in check for all AND if he currently is in check
    * it is checkmate.
    *
    * returns ::= {
    *    stalemate: t/f
    *    checkmate: t/f
    * }
    */
   Game.prototype.isCheckMateForTeam = function(team){
      var king   = team === 'white' ? this.whiteKing : this.blackKing;
      var moves = this.getMoveSquaresForPiece(king, team);
      var check = team === 'white' ? this.whiteCheck : this.blackCheck;

      //Assume it's checkmate until we find a move that does not result in check
      var checkmate = true;
      for(var i = 0; i < moves.length; i++){
         //&&= and &= are not defined as operators in Ecmascript
         checkmate = checkmate && this.moveResultsInCheck(king, this.board.squares[moves[i].x][moves[i].y], team);
      }

      return {
         checkmate: check && checkmate,
         stalemate: !check && checkmate /*TODO also need to make sure no other pieces can move..? Stalemate is hard */
      };
   }

   /*
    * Returns the square that piece is on
    */
   Game.prototype.getSqrForPiece = function(piece){
      return this.board.squares[piece.xpos][piece.ypos];
   }

   /*
    * returns the piece that is on the square given by the 0-based coordinates x, y
    * from whites perspective
    */
   Game.prototype.getPieceFromCoord = function(x,y){
      return this.board.squares[x][y].piece;
   }


   /*
    * Print out the moves in pgn form.
    */
   Game.prototype.toHtmlTable = function(){
      var html = '<table>\n' + 
         '<thead>\n' + 
         '<tr>\n' + 
         '<th>White</th> \n' + 
         '<th>Black</th> \n' + 
         '</tr>\n' + 
         '</thead>\n' + 
         '<tbody>';
      for(var i = 0; i < this.moves.length; i++){
         if(i % 2 == 0){
            html += '<tr>';
         }
         html += '<td>' + this.moves[i] + '</td>';
         if(i % 2 == 1){
            html += '</tr>\n';
         }
      }

      return html + '</tbody>\n</table>';
   }

   /*
    * Used for testing and in Ai's
    */
   Game.prototype.runMoves = function(pgnAry){
      for(var i = 0; i < pgnAry.length; i++){
         var err = this.validateMove(pgnAry[i], this.turn);
         if(err.valid){
            this.processMove(pgnAry[i], this.turn);
         }else{
            throw pgnAry[i] + ' was an invalid move: ' + err.desc;
         }
      }
   }

   /*
    * Return the first piece that can move to the sqr on team team
    * It is assumed that the pgn that this game is fed is actually valid (training data)
    * so this assumption should be fine
    */
   Game.prototype.getPieceThatCanMoveToCoord = function(coordStr, team, name, colContext){
      var pieces = team === 'black' ? this.black : this.white;
      var sqr = Utils.pgnSqrToCoords(coordStr);
      var game = this;
      return pieces.filter(function(x){
         var keep = true;
         if(name){
            keep = x.name === name;
            if(keep && colContext){//also filter anything not in the same column
               var colNum = colContext.charCodeAt(0) - 'a'.charCodeAt(0);
               keep = x.xpos == colNum;
            }
         }
         return keep && Utils.isSqrInAry(game.getValidMovesForPiece(x), sqr);//Just trying to save some cycles
      })[0]; //let it throw an exception I need to know why anyways
   }

   Game.prototype.canPromote = function(piece){
      return (piece.name === 'P'  &&
              ((piece.ypos === 0 && piece.color === 'black' ) ||
               (piece.ypos === 7 && piece.color === 'white' )));
   }

   /*
    * Since getValidMovesForPiece adds in castling,
    * this method takes a kind and a move and sees if it actually is 
    * a castle.  Returns either the pgn passed or transforms
    * it to O-O or O-O-O
    *
    * customPgn || 'd3-d4'
    */
   Game.prototype.isPgnMoveCastle = function(king, customPgn){
      var ary = customPgn.split('-');
      if(king.color === 'black'){
         if(ary[1] === 'c8'){
            if(this.canCastle('O-O-O', 'black')){
               customPgn = 'O-O-O';
            }
         }else if(ary[1] === 'g8'){
            if(this.canCastle('O-O', 'black')){
               customPgn = 'O-O';
            }
         }
      }else{
         if(ary[1] === 'c1'){
            if(this.canCastle('O-O-O', 'white')){
               customPgn = 'O-O-O';
            }
         }else if(ary[1] === 'g1'){
            if(this.canCastle('O-O', 'white')){
               customPgn = 'O-O';
            }
         }
      }
      return customPgn;
   }

   //Expose Game
   return Game;
});
