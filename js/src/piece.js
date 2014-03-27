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
   this.name = '';
   this.xpos = init.xpos;
   this.ypos = init.ypos;
   this.initialPos = true;
}

Piece.prototype.move = function(){
}


function Knight(init){
   Piece.call(this,init);
   this.name = 'N';
}



function Bishop(init){
   Piece.call(this,init);
   this.name = 'B';
}

function Rook(init){
   Piece.call(this,init);
   this.name = 'R';
}


function Queen(init){
   Piece.call(this,init);
   this.name = 'Q';
}


function King(init){
   Piece.call(this,init);
   this.name = 'K';
}

function extend(parent, child){
   child.prototype = Object.create(parent.prototype);
   child.prototype.constructor = child;
}

extend(Piece, Knight);
extend(Piece, King);
extend(Piece, Bishop);
extend(Piece, Rook);
extend(Piece, Queen);

