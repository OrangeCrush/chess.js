function drawBoard(canvas_context, startx, starty, width, height){
   for(var i = 0; i < 8; i++){ //Columns
      for(var j = 0; j < 8; j++){ //Rows
         if(i % 2 == 0){
            if(j % 2 == 0){
               canvas_context.fillRect(startx + i * width / 8 , starty + j * height / 8, width / 8, height / 8);
            }
         }else{
            if(j % 2 != 0){
               canvas_context.fillRect(startx + i * width / 8 , starty + j * height / 8, width / 8, height / 8);
            }
         }
      }
   }
}

var images = {}

function loadImage(url, next){
   var img = new Image();
   img.src = url;
   img.onload = function(){
      images[url] = img;
      next(img);
   }
}

/*
 * Draw a colored (black | white) 64x64 Piece (P,K,W,B,R,N) on sqr (a3,d5,h8)
 */
function drawPiece(ctx, piece, color, sqr){
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
   loadImage('img/sprite.png', function(img){
      //img, src.x, src.y, width, height, dest.x, dest.y, width, height
      //ctx.drawImage(img, 0,0, 64,64, 0,0, 64,64);
      ctx.drawImage(img, 64 * pieces[piece], colors[color] * 64, 64,64, coords.x * 64, (7 - coords.y) * 64, 64,64);
   });
}
