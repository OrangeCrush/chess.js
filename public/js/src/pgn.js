function PGN(init){
   this.game = new Game();
   this.original = init.pgn; 
   this.resetPreconditions();
   this.parsedPGN = [];  //tokens
   this.moveStack = [];  //will eventually implement goign backwards
   this.tryParsingRealPGN(init.pgn);

}

/*
 * First pass through the PGN.
 * Takes out all tags:  []
 * Takes out all comments : {}
 * Trims whitespace on pgn tokens
 * Sets parsedPGN to an array of PGN tokens
 */
PGN.prototype.tryParsingRealPGN = function(){
   //Remove comments
   var pgnBlock = this.original;
   var pgnMoves = pgnBlock.replace(/{.*?}/g, '').replace(/\[.*?\]/g, '');//.replace(/[#+=]/, '');
   this.parsedPGN =  pgnMoves.split(/[0-9]+\./).filter(function(x){
      return !x.match(/^\s+$/) && x !== '';
   }).map(function(x){
      return x.trim().split(/\s+/);     
   });
}

/*
 * Full blown PGN reader.  Only should be used by testing things
 * and probably not AI's (Should be easier to generate the normal and sane h3-h6 type PGN)
 *
 * returns ::= [...
 *    e4-e6,
 *    f5-f8,
 *    O-O-O,
 *    etc
 * ...] // instead of this Qe5xe4 garbage
 */
PGN.prototype.parseRealPGNAry = function(pgnAry){
   //Try to categorize it
   var normalPgn = []
   for(var i = 0; i < pgnAry.length; i++){
      for(var j = 0 ; j < 2; j++){//make two moves
         var realMove = this.parseRealPgnMove(pgnAry[i][j]);
         normalPgn.concat(realMove);
         this.game.processMove(realMove, j == 0 ? 'white' : 'black');
      }
   }
   return normalPgn;
}

/*
 * Trys to read one real pgn move and a sane version of pgn
 *    if it's a castle just return it as is
 */
PGN.prototype.parseRealPgnMove = function(pgn){
   if(pgn === 'O-O-O' || pgn === 'O-O'){
      return pgn;
   }else if(pgn.match(/^[BRKPNQ]?[a-h]?[x-]?[a-h][1-8]$/i)){ //e4 or Nbd7
      var nameCol = nameAndCol(pgn);
      piece = this.game.getPieceThatCanMoveToCoord(pgn, this.game.turn, nameCol.name, nameCol.col);
      return piece.coordsToString() + '-' + this.stripNameAndCol(pgn);
   }else{
      throw 'Invalid pgn in parseRealPgnMove: ' + pgn;
   }
}
//
/*
 * Turns e4 -> e4
 *       Be4 -> e4
 *       axb4 -> b4
 */
PGN.prototype.stripNameAndCol = function(pgnSqr){
   if(pgnSqr.length >= 4){
      return pgnSqr.slice(2,4);
   }else if(pgnSqr.length === 3){
      return pgnSqr.slice(1,3);
   }else if(pgnSqr.length == 2){
      return pgnSqr;
   }else{
      throw 'Unexpected Length in stripNameAndCol: ' + pgnSqr.length;
   }
}


/*
 * returns ::= {name: "R" col:"b"} for example
 * Some different cases this will handle
 *
 * Bd3
 */
function nameAndCol(pgn){
   if(pgn.length === 3){//Pe4
      return {
         name: pgn[0],
         col: null
      };
   }else if(pgn.length == 4 && pgn.indexOf('x') == -1){//Nbd7
      return {
         name: pgn[0],
         col:pgn[1]
      };
   }else if(pgn.length == 4 && pgn.indexOf('x') != -1){//Nxd3  or cxd4
      if(pgn.match(/^[a-h]/)){
         return {
            name: 'P',
            col: pgn[0]
         };
      }
      return {
         name: pgn[0],
         col: null
      };
   }else if(pgn.length == 5 && pgn.indexOf('x') != -1){//Nbxd4
      return {
         name: pgn[0],
         col:pgn[1]
      };
   }else{
      throw "Unexpected move in nameAndCol"
   }
}

/*
 * We want to store preconditions on the object so we can check them after the turn is over.
 * We also don't want them in the token, so if we find one take it off.
 * If we need to we can use capturing as a precondition 
 * Return the changed token
 */
PGN.prototype.handlePreconditions =  function(pgnToken){
   var team = otherTeam(this.game.turn);
   if(pgnToken[pgnToken.length - 1] === '+'){
      this.pre[team].check = true;
      pgnToken = pgnToken.slice(0, pgnToken.length - 1);
   }else if(pgnToken[pgnToken.length - 1] === '#'){
      this.pre[team].checkmate = true;
      pgnToken = pgnToken.slice(0, pgnToken.length - 1);
   }
   return pgnToken;
}

/*
 * Check if the preconditions set for the turn actually were
 * reflected in the game.  If not, theres a good chance
 * we messed something up.
 */
PGN.prototype.verifyPreconditions = function(){
   var valid = this.pre['black'].check == this.game.blackCheck &&
               this.pre['white'].check == this.game.whiteCheck;
   this.resetPreconditions();
   return valid;
}

/*
 * Run a single pgn token.  Decide what move should be played out,
 * make the move, and update the status of the game.  Checks preconditions and
 * resets them.  Translates moves into a form sq-sq. Puts moves on the stack.
 */
PGN.prototype.runToken = function(rawPgn){
   var pgnToken =  this.handlePreconditions(rawPgn);
   if(!this.isTokenEndGame(pgnToken)){
      if(isPGNCastle(pgnToken)){
         this.game.processMove(pgnToken, this.game.turn);
      }else if(pgnToken.length <= 3){
         if(pgnToken.length === 2){//add the pawn name on for filtering + then it wont matter if they actually have it
            pgnToken = 'P' + pgnToken;
         }
         //Process standard move -> in format <Piece><col><row>
         var nameCol = nameAndCol(pgnToken);
         var piece = this.game.getPieceThatCanMoveToCoord(pgnToken, this.game.turn, nameCol.name, nameCol.col);
         var realMove = this.pushMoveByPiece(piece, pgnToken);
         this.game.processMove(realMove, this.game.turn);
      }else if(pgnToken.length <= 5){
         var nameCol = nameAndCol(pgnToken);
      var piece = this.game.getPieceThatCanMoveToCoord(pgnToken, this.game.turn, nameCol.name, nameCol.col);
         var realMove = this.pushMoveByPiece(piece, pgnToken);
         this.game.processMove(realMove, this.game.turn);
      }else{
         throw "Unrecognized Token in runToken: " + pgnToken;
      }

   }else{//Game Over
      console.log('Game Over!');
   }
   if(!this.verifyPreconditions()){
      throw "Conditions not verified correctly after move " + pgnToken;
   }
}

PGN.prototype.resetPreconditions = function(){
   this.pre = {black:{check:false, checkmate:false}, white:{check:false, checkmate:false}}; //track conditions
}

/*
 * Convert moves to a1-a1 format
 * Also return last pushed square.
 */
PGN.prototype.pushMoveByPiece = function(piece, pgn){
   this.moveStack.unshift(piece.coordsToString() + '-' + this.stripNameAndCol(pgn));
   return this.moveStack[0];
}

/*
 * Returns true if the token is an end game token
 * 1-0      white won
 * 0-1      black won
 * 1/2-1/2  draw
 * *        ongoing game
 */
PGN.prototype.isTokenEndGame = function(pgntoken){
   return pgntoken === '1-0' || pgntoken === '0-1' || pgntoken === '1/2-1/2' || pgntoken === '*';
}


var block = '[Event "F/S Return Match"]' + '\n' +
'[Site "Belgrade, Serbia Yugoslavia|JUG"]' + '\n' +
'[Date "1992.11.04"]' + '\n' +
'[Round "29"]' + '\n' +
'[White "Fischer, Robert J."]' + '\n' +
'[Black "Spassky, Boris V."]' + '\n' +
'[Result "1/2-1/2"]' + '\n' +
 
'1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 {This opening is called the Ruy Lopez.}' + '\n' +
'4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8  10. d4 Nbd7' + '\n' +
'11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5' + '\n' +
'Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6' + '\n' +
'23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5' + '\n' +
'hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5' + '\n' +
'35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6' + '\n' +
'Nf2 42. g4 Bd3 43. Re6 1/2-1/2' + '\n';


var block2 = '[Event "FIDE-Wch k.o. g/25+10"]' + '\n' + 
'[Site "Las Vegas"]' + '\n' + 
'[Date "1999/08/14"]' + '\n' + 
'[Round "5.4"]' + '\n' + 
'[White "Kramnik, Vladimir"]' + '\n' + 
'[Black "Adams, Michael"]' + '\n' + 
'[Result "1/2-1/2"]' + '\n' + 
'[WhiteElo "2760"]' + '\n' + 
'[BlackElo "2708"]' + '\n' + 
'[ECO "A17"]' + '\n' + 

'1.Nf3 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 O-O 5.a3 Bxc3 6.Qxc3 b6 7.e3 Bb7 8.Be2 c5' + '\n' + 
'9.b4 d6 10.Bb2 e5 11.O-O Re8 12.d3 Nbd7 13.Rfe1 a5 14.bxc5 bxc5 15.d4 Ne4' + '\n' + 
'16.Qc2 cxd4 17.exd4 Ng5 18.Nxg5 Qxg5 19.d5 f5 20.Rab1 Nc5 21.Bc3 Bc8 22.Rb6 Rd8' + '\n' + 
'23.Rb5 f4 24.Bf1 Bf5 25.Qd1 Rdc8 26.Rxa5 Rxa5 27.Bxa5 h5 28.Bb4  1/2-1/2' + '\n'; 

