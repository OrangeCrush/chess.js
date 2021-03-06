define(function(require, exports, module){
   var Utils = require('Utils');
   /* 
    * init.color-> color of the piece..
    *        /(black|white)/
    */

   /*
    * Default Piece class specifying a Pawn
    * xpos and ypos are passed in
    * initialPos
    */
   function Piece(init){
      this.name       = 'P';
      this.xpos       = init.xpos;
      this.ypos       = init.ypos;
      this.color      = init.color;
      this.initialPos = true;
   }


   Piece.prototype.equals = function(piece){
      return this.xpos === piece.xpos && this.ypos === piece.ypos && this.name === piece.name && this.color === piece.color;
   }

   Piece.prototype.toString = function(){
      return this.name;
   }

   /*
    * Actually go backwards now and go from 0 based
    * x-y coords to a-h 1-8
    */
   Piece.prototype.coordsToString = function(){
      return Utils.coordsToPgnSqr(this.xpos, this.ypos);
   }


   function Knight(init){
      Piece.call(this, init);
      this.name = 'N';
   }
   Utils.extend(Piece, Knight);

   Knight.prototype.movePattern = function(){
      var moves = [];
      moves.push({x: this.xpos + 2, y: this.ypos + 1});
      moves.push({x: this.xpos + 2, y: this.ypos - 1});
      moves.push({x: this.xpos - 2, y: this.ypos + 1});
      moves.push({x: this.xpos - 2, y: this.ypos - 1});

      moves.push({x: this.xpos + 1, y: this.ypos + 2});
      moves.push({x: this.xpos + 1, y: this.ypos - 2});
      moves.push({x: this.xpos - 1, y: this.ypos + 2});
      moves.push({x: this.xpos - 1, y: this.ypos - 2});

      return moves.filter(onBoard);
   }

   function Bishop(init){
      Piece.call(this, init);
      this.name = 'B';
   }
   Utils.extend(Piece, Bishop);

   Bishop.prototype.movePattern = function(){
      var moves = [];
      for(var i = 1; i <= 7; i ++){
         moves.push({x: this.xpos + i, y: this.ypos + i});
         moves.push({x: this.xpos + i, y: this.ypos - i});
         moves.push({x: this.xpos - i, y: this.ypos + i});
         moves.push({x: this.xpos - i, y: this.ypos - i});
      }
      return moves.filter(onBoard);
   }

   function Rook(init){
      Piece.call(this, init);
      this.name = 'R';
   }
   Utils.extend(Piece, Rook);

   Rook.prototype.movePattern = function(){
      var moves = [];
      for(var i=1; i <= 7; i ++){
         moves.push({x: this.xpos + i, y: this.ypos });
         moves.push({x: this.xpos, y: this.ypos + i });
         moves.push({x: this.xpos - i, y: this.ypos });
         moves.push({x: this.xpos, y: this.ypos - i });
      }
      return moves.filter(onBoard);
   }


   function Queen(init){
      Piece.call(this, init);
      this.name = 'Q';
   }
   Utils.extend(Piece, Queen);


   function King(init){
      Piece.call(this, init);
      this.name = 'K';
   }
   Utils.extend(Piece, King);

   return function(){
      return {
         Piece:Piece,
         Knight:Knight,
         Queen:Queen,
         King:King,
         Rook:Rook,
         Bishop:Bishop
      };
   };
});
