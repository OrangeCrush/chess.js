/*
 * Extend the Game class to also
 * include a canvas based interface.
 * In init, must pass in promote callback and 
 * a 'canvas' element that the game will run on
 * piece_size will scale the size of the board.  default is 64
 */
function CanvasGameBoard(init){
   /*
    * Anything that shouldn't be deep copied goes here (IE anything that doesn't matter)
    */
   this.sc = new SingletonContainer({
      canvas : init.canvas,
      ctx : init.canvas.getContext('2d'),
      images : {}
   });


   this.pieceSize = init.pieceSize || 64;
   this.sc.canvas.width = this.sc.canvas.height = this.pieceSize * 8;
   Game.call(this, init); //super

   var self = this;
   this.sc.canvas.onclick = function(e){
      e.preventDefault();
      var x = e.pageX - (self.sc.canvas.offsetLeft + 2);
      var y = e.pageY - (self.sc.canvas.offsetTop + 2);
      alert(coordsToPgnSqr(Math.ceil(x / self.pieceSize) - 1, 8 - Math.ceil(y / self.pieceSize)) +' : ' +  x + ' ' + y);
   };

}
extend(Game, CanvasGameBoard);

CanvasGameBoard.prototype.loadImage = function(url, next){
   if(!this.sc.images[url]){
      var img = new Image();
      img.src = url;
      var self = this;
      img.onload = function(){
         self.sc.images[url] = img;
         next(img);
      }
   }else{
      next(this.sc.images[url]);
   }
}

CanvasGameBoard.prototype.drawPiece = function(piece, color, sqr){
   var pieces = {
      'P':0,
      'B':1,
      'N':2,
      'R':3,
      'Q':4,
      'K':5
   };

   colors = {
      'white':0,
      'black':1
   }

   var coords = pgnSqrToCoords(sqr);
   var self = this;
   this.loadImage('img/sprite.png', function(img){
      //img, src.x, src.y, width, height, dest.x, dest.y, width, height
      //Basically a hardcode with img/sprite.png
      self.sc.ctx.drawImage(img, 64 * pieces[piece], colors[color] * 64, 64,64, coords.x * self.pieceSize, (7 - coords.y) * self.pieceSize, self.pieceSize, self.pieceSize);
   });
}

CanvasGameBoard.prototype.drawBoard = function(startx, starty, width, height){
   for(var i = 0; i < 8; i++){ //Columns
      for(var j = 0; j < 8; j++){ //Rows
         if(i % 2 == 0){
            if(j % 2 == 0){
               this.sc.ctx.fillRect(startx + i * width / 8 , starty + j * height / 8, width / 8, height / 8);
            }
         }else{
            if(j % 2 != 0){
               this.sc.ctx.fillRect(startx + i * width / 8 , starty + j * height / 8, width / 8, height / 8);
            }
         }
      }
   }

}




/*
 * Draws a board from perspectives (black|white) perspective
 */
CanvasGameBoard.prototype.redrawGame = function(perspective){

   this.sc.ctx.clearRect(0, 0, this.pieceSize * 8, this.pieceSize * 8);
   this.sc.ctx.fillStyle = 'rgb(103,110,39)'

   this.drawBoard(0, 0, this.pieceSize * 8, this.pieceSize * 8);


   var joined = this.white.concat(this.black);

   for(var i = 0; i < joined.length; i++){
      this.drawPiece(joined[i].name, joined[i].color, joined[i].coordsToString());
   }
}

/*
 * Since the deep copy algorithm I wrote
 * doesn't handle ciruclar references
 * I need to make sure that I wrap canvas, image, etc into
 * this.  Kind of a hack. idk what else to do.
 */
function SingletonContainer(init){
   for(var key in init){
      this[key] = init[key]
   }
}
