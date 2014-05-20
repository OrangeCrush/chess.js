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
      if(obj[key] instanceof SingletonContainer){
         continue;
      }else if(obj[key] instanceof Array){
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

function coordsToPgnSqr(x,y){
   return String.fromCharCode('a'.charCodeAt(0) + x) + (y + 1);
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

/*
 * re maps coordinates as if you flipped the board around
 */
function flipCoord(coordStr){
   var xy = pgnSqrToCoords(coordStr);
   return coordsToPgnSqr(7 - xy.x, 7 - xy.y);
}

//Flips squares in format {x:6, y:7}
function flipSqr(sqr){
   return {
      x: 7- sqr.x,
      y: 7 - sqr.y
   };
}
