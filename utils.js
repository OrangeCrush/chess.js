/*
 * EcmaScript 5+ inhertience
 */
define(function(require, exports, module){
  var SingletonContainer =  require('SingletonContainer');
   exports.extend = function(parent, child){
      child.prototype = Object.create(parent.prototype);
      child.prototype.constructor = child;
   }

   /*
    * Checks if space.x and space.y are on the chess board
    */
   exports.onBoard = function(space){
      return (0 <= space.x && space.x <= 7) && (0 <= space.y && space.y <= 7);
   }


   exports.isPGNCastle = function(pgn){
      return pgn === 'O-O-O' || pgn === 'O-O';
   }

   exports.pgnSqrToCoords = function(pgnSqr){
      return {
         x: pgnSqr[pgnSqr.length - 2].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0),
         y: +pgnSqr[pgnSqr.length - 1] - 1
      }
   }

   exports.errMsg = function(code, msg, loc){
      return {
         errCode: code,
         message: msg,
         location: 'In: ' + loc
      }
   }

   exports.otherTeam = function(team){
      return team === 'white' ? 'black' : 'white';
   }


   exports.isSqrInAry = function(ary, sqr){
      for(var i =0; i < ary.length; i++){
         if(ary[i].x === sqr.x && ary[i].y === sqr.y){
            return true;
         }
      }
      return false;
   }

   exports.deepCopyObj = function(obj){
      var x = {};
      for(var key in obj) {
         if(obj[key] instanceof SingletonContainer){
            continue;
         }else if(obj[key] instanceof Array){
            x[key] = this.deepCopyAry(obj[key]);
         }else if(obj[key] instanceof Function){
            x[key] = obj[key].bind(x);
         }else if(obj[key] instanceof Object){
            x[key] = this.deepCopyObj(obj[key]);
         }else{//primative
            x[key] = obj[key];
         }
      }
      return x;
   }

   exports.coordsToPgnSqr = function(x,y){
      return String.fromCharCode('a'.charCodeAt(0) + x) + (y + 1);
   }
   exports.deepCopyAry = function(ary){
      var copy = [];
      for(var x in ary){
         if(ary[x] instanceof Array){
            copy[x] = this.deepCopyAry(ary[x]);
         }else if(ary[x] instanceof Object){
            copy[x]  = this.deepCopyObj(ary[x]);
         }else{//Primative, make shallow copy
            copy[x] = ary[x];
         }
      }
      return copy;
   }

   /*
    * re maps coordinates as if you flipped the board around
    */
   exports.flipCoord = function(coordStr){
      var xy = this.pgnSqrToCoords(coordStr);
      return this.coordsToPgnSqr(7 - xy.x, 7 - xy.y);
   }

   //Flips squares in format {x:6, y:7}
   exports.flipSqr = function(sqr){
      return {
         x: 7- sqr.x,
         y: 7 - sqr.y
      };
   }
});
