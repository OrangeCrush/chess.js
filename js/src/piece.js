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

Piece.prototype.toString = function(){
   return this.name;
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


var whatever = new Queen({color:'white', xpos:4, ypos:4});
console.log(whatever.movePattern());
