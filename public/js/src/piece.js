/* 
 * init.color-> color of the piece..
 *        /(black|white)/
 *
 * 
 *
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

Piece.prototype.movePattern = function(){
   var moves = [];

   //todo pawns can take diagonally..
   moves.push({x: this.xpos, y: this.color === 'white' ? this.ypos + 1 : this.ypos - 1});

   //If the pawn has not moved yet, it can move forward two
   if(this.initialPos){
      moves.push({
         x: this.xpos,
         y: this.color === 'white' ? this.ypos + 2 : this.ypos - 2
      });
   }

   return moves.filter(onBoard);
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
   return String.fromCharCode('a'.charCodeAt(0) + this.xpos) + (this.ypos + 1);
}


function Knight(init){
   Piece.call(this, init);
   this.name = 'N';
}
extend(Piece, Knight);

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
extend(Piece, Bishop);

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
extend(Piece, Rook);

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
extend(Piece, Queen);

Queen.prototype.movePattern = function(){
   var moves = [];

   for(var i = 1; i <= 7; i++){
      moves.push({x: this.xpos + i, y: this.ypos });
      moves.push({x: this.xpos, y: this.ypos + i });
      moves.push({x: this.xpos - i, y: this.ypos });
      moves.push({x: this.xpos, y: this.ypos - i });

      moves.push({x: this.xpos + i, y: this.ypos + i});
      moves.push({x: this.xpos + i, y: this.ypos - i});
      moves.push({x: this.xpos - i, y: this.ypos + i});
      moves.push({x: this.xpos - i, y: this.ypos - i});
   }
   return moves.filter(onBoard);
}

function King(init){
   Piece.call(this, init);
   this.name = 'K';
}
extend(Piece, King);

King.prototype.movePattern = function(){
   var moves = [];
   moves.push({x: this.xpos + 1, y: this.ypos });
   moves.push({x: this.xpos, y: this.ypos + 1 });
   moves.push({x: this.xpos - 1, y: this.ypos });
   moves.push({x: this.xpos, y: this.ypos -i });

   moves.push({x: this.xpos + 1, y: this.ypos + 1});
   moves.push({x: this.xpos + 1, y: this.ypos - 1});
   moves.push({x: this.xpos - 1, y: this.ypos + 1});
   moves.push({x: this.xpos - 1, y: this.ypos - 1});

   return moves.filter(onBoard)
}

