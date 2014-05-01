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

function isPGNCastle(pgn){
   return pgn === 'O-O-O' || pgn === 'O-O';
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

function otherTeam(team){
   return team === 'white' ? 'black' : 'white';
}


function isSqrInAry(ary, sqr){
   for(var i =0; i < ary.length; i++){
      if(ary[i].x === sqr.x && ary[i].y === sqr.y){
         return true;
      }
   }
   return false;
}

function deepCopyObj(obj){
   var x = {};
   for(var key in obj) {
      if(obj[key] instanceof Array){
         x[key] = deepCopyAry(obj[key]);
      }else if(obj[key] instanceof Function){
         x[key] = obj[key].bind(x);
      }else if(obj[key] instanceof Object){
         x[key] = deepCopyObj(obj[key]);
      }else{//primative
         x[key] = obj[key];
      }
   }
   return x;
}

function deepCopyAry(ary){
   var copy = [];
   for(var x in ary){
      if(ary[x] instanceof Array){
         copy[x] = deepCopyAry(ary[x]);
      }else if(ary[x] instanceof Object){
         copy[x]  = deepCopyObj(ary[x]);
      }else{//Primative, make shallow copy
         copy[x] = ary[x];
      }
   }
   return copy;
}

function tryParsingRealPGN(pgnBlock){
   //Remove comments
   var pgnMoves = pgnBlock.replace(/{.*?}/g, '').replace(/\[.*?\]/g, '').replace(/[#+=]/, '');
   var movesPgn =  pgnMoves.split(/[0-9]+\./).filter(function(x){
      return !x.match(/^\s+$/) && x !== '';
   }).map(function(x){
      return x.trim().split(/\s+/);     
   });
   return parseRealPgnAry(movesPgn);
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
function parseRealPgnAry(pgnAry){
   //Try to categorize it
   var normalPgn = []
   var g1 = new Game(); //Temporary game to resolve the ambiguity of the 'Machine friendly' pgn
   for(var i = 0; i < pgnAry.length; i++){
      for(var j = 0 ; j < 2; j++){//make two moves
         var realMove = parseRealPgnMove(pgnAry[i][j], game)
         normalPgn.concat(realMove);
         game.processMove(realMove);
      }
   }
   return normalPgn;
}

/*
 * Trys to read one real pgn move and a sane version of pgn
 *    if it's a castle just return it as is
 */
function parseRealPgnMove(pgn, game){
   if(pgn === 'O-O-O' || pgn === 'O-O'){
      return pgn;
   }else if(pgn.match(/^[BRKPNQ]?[a-h][1-8]$/i)){ //e4
      var piece = game.getPieceThatCanMoveToCoord(pgn, game.turn, );
      return piece.coordsToString() + '-' + stripNameAndCol(pgn);
   //}else if(pgn.match()){
   }else{
      throw 'Invalid pgn in parseRealPgnMove: ' + pgn;
   }
}

/*
 * Turns e4 -> e4
 *       Be4 -> e4
 *       axb4 -> b4
 */
function stripNameAndCol(pgnSqr){
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

function return NameAndCol(){
   //TODO since its like 4:00am make this return {name: col:} for a given bulshit pgn string
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
