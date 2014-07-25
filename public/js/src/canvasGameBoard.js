define(function(require, exports, module){
   var Game = require('Game');
   var Utils = require('Utils');
   var SingletonContainer = require('SingletonContainer');
   var BLACK = 'rgb(0,0,0)';
   var WHITE = 'rgb(255,255,255)';


   /*
    * Extend the Game class to also
    * include a canvas based interface.
    * In init, must pass in promote callback and 
    * a 'canvas' element that the game will run on
    * piece_size will scale the size of the board.  default is 64
    * perspective decides what color starts on bottom..
    *
    * init.moveCallBack is called when the user clicks and makes
    * their move.
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

      this.moveCallBack = init.moveCallBack;

      this.font = init.font || '15px Arial';
      this.perspective = init.perspective || 'white';
      this.pieceSize = init.pieceSize || 64;

      this.sc.canvas.height = this.pieceSize * 8 ;
      this.sc.canvas.width = this.pieceSize * 8 * 2;  //Allow for two side pannels
      Game.call(this, init); //super

      var self = this;
      this.sc.canvas.onclick = function(e){
         e.preventDefault();
         var point = self.normalizePoint({x:e.pageX, y: e.pageY});

         //Sometimes you are able to go past the max barriers..not sure why.  but set a boundary here..
         if(point.x > self.sc.canvas.width){
            point.x = self.sc.canvas.width;  
         }
         if(point.y > self.sc.canvas.height){
            point.y = self.sc.canvas.height;
         }

         var coord = {x: Math.ceil(point.x / self.pieceSize) - 1, y:8 - Math.ceil(point.y / self.pieceSize)};
         if(self.perspective === 'black'){//Utils.flip the coords
            coord = Utils.flipSqr(coord);
         }
         if(Utils.onBoard(coord)){
            self.handleClick(coord);
         }
      };

      this.firstClick = false;
      this.beingMoved = '';
      this.highlighted = [];

      //Where to draw the board starting from
      this.drawBoardX = init.drawBoardX || this.sc.canvas.width / 4;
      this.drawBoardY = init.drawBoardY || 0;
      

      this.lightColor = init.lightColor || 'rgb(242,200,133)'; //beige
      this.darkColor = init.darkColor   || 'rgb(110,64,0)'; //Marble
      this.highlightColor  = init.highlightColor   || 'rgba(0,0,128,0.5)'; //blue
      this.moveColor  = init.moveColor   || 'rgba(255,64,64,0.5)'; //pink
      this.labelColor  = init.labelColor   || 'rgba(255,85,0,1)'; //lime green

      this.redrawGame();
   }
   Utils.extend(Game, CanvasGameBoard);

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

   CanvasGameBoard.prototype.drawPieceOnBoard = function(piece, color, sqr){
      var coords = Utils.pgnSqrToCoords(sqr);
      var self = this;
      this.drawPieceAt(piece, color, this.drawBoardX + (coords.x * this.pieceSize), this.drawBoardY + (7 - coords.y) * this.pieceSize);
   }

   CanvasGameBoard.prototype.drawBoard = function(startx, starty, width, height){
      for(var i = 0; i < 8; i++){ //Columns
         for(var j = 0; j < 8; j++){ //Rows
            if(i % 2 == 0){
               if(j % 2 == 0){
                  this.sc.ctx.fillStyle = this.darkColor;
                  this.sc.ctx.fillRect(startx + i * width / 8 , starty + j * height / 8, width / 8, height / 8);
               }else{
                  this.sc.ctx.fillStyle = this.lightColor;
                  this.sc.ctx.fillRect(startx + i * width / 8 , starty + j * height / 8, width / 8, height / 8);
               }
            }else{
               if(j % 2 != 0){
                  this.sc.ctx.fillStyle = this.darkColor;
                  this.sc.ctx.fillRect(startx + i * width / 8 , starty + j * height / 8, width / 8, height / 8);
               }else{
                  this.sc.ctx.fillStyle = this.lightColor;
                  this.sc.ctx.fillRect(startx + i * width / 8 , starty + j * height / 8, width / 8, height / 8);
               }
            }
         }
      }
      this.sc.ctx.strokeStyle = 'black';
      this.sc.ctx.lineWidth = 3;
      this.sc.ctx.strokeRect(this.drawBoardX,this.drawBoardY,this.pieceSize * 8,this.pieceSize * 8);
   }


   /*
    * Draws a board from 
    */
   CanvasGameBoard.prototype.redrawGame = function(){

      this.sc.ctx.clearRect(0, 0, this.pieceSize * 8 * 2, this.pieceSize * 8);
      this.sc.ctx.fillStyle = WHITE;
      this.sc.ctx.fillRect(0,0, this.sc.canvas.width, this.sc.canvas.height);

      this.drawBoard(this.drawBoardX, this.drawBoardY, this.pieceSize * 8, this.pieceSize * 8);

      this.drawLastMove(); //Want the last move to be highlighted under the piece not above

      var joined = this.white.concat(this.black);

      for(var i = 0; i < joined.length; i++){
         if(this.perspective === 'white'){
            this.drawPieceOnBoard(joined[i].name, joined[i].color, joined[i].coordsToString());
         }else{
            this.drawPieceOnBoard(joined[i].name, joined[i].color, Utils.flipCoord(joined[i].coordsToString()));
         }
      }
      this.drawLabels();
      this.drawCaptured();
      this.drawStats();
      this.pickAndDrawGameAlert();
   }

   CanvasGameBoard.prototype.handleClick = function(sqr){
      if(this.turn === this.perspective){//if it's actually the users turn
         if(this.board.squares[sqr.x][sqr.y].piece && this.board.squares[sqr.x][sqr.y].piece.color === this.turn){//If they have clicked on their own piece..
            if(this.clickedPiece && this.clickedPiece.equals(this.board.squares[sqr.x][sqr.y].piece)){//clicked on same piece
               this.clickedPiece = null;
               this.redrawGame();
            }else{//clicked on new piece
               this.clickedPiece = this.board.squares[sqr.x][sqr.y].piece;
               this.displayMoveSquaresForSquare(sqr);
            }
         }else if(this.clickedPiece && (this.perspective === 'white' && Utils.isSqrInAry(this.highlighted, sqr)
            || this.perspective === 'black' && Utils.isSqrInAry(this.highlighted, Utils.flipSqr(sqr)))){//if they clicked on a highlighted sqr and are white
               var customPgn = this.clickedPiece.coordsToString() + '-'  + Utils.coordsToPgnSqr(sqr.x,sqr.y);
               if(this.clickedPiece.name === 'K'){//Check if the mvoe was a castle, and transform pgn if it was
                  customPgn = this.isPgnMoveCastle(this.clickedPiece, customPgn);
               }
               if(this.validateMove(customPgn, this.turn)){
                  this.moveCallBack({
                     pgn:customPgn,
                     color: this.turn
                  });
                  this.processMove(customPgn, this.turn);
               }
               this.clickedPiece = null;
               this.redrawGame();//clicked off
            }else{//clicked off so just get rid of highlight
               this.clickedPiece = null;
               this.redrawGame();//clicked off
            }
      }
   }

   CanvasGameBoard.prototype.displayMoveSquaresForSquare = function(sqr){
      this.redrawGame();
      var sqrs = this.getValidMovesForPiece(this.board.squares[sqr.x][sqr.y].piece);
      this.highlighted = sqrs;
      this.beingMoved = Utils.coordsToPgnSqr(sqr);
      for(var i = 0; i < sqrs.length; i++){
         this.sc.ctx.fillStyle = this.moveColor;
         if(this.perspective === 'black'){
            sqrs[i] = Utils.flipSqr(sqrs[i]);
         }
         this.sc.ctx.fillRect(this.drawBoardX + sqrs[i].x * this.pieceSize, this.drawBoardY + (7 - sqrs[i].y) * this.pieceSize, this.pieceSize, this.pieceSize);
      }
   }

   CanvasGameBoard.prototype.drawLabels = function(){
      this.sc.ctx.font = 'Bold ' + this.font;
      this.sc.ctx.fillStyle = this.labelColor;
      for(var i = 0; i < 8; i++){
         if(this.perspective === 'white'){
            this.sc.ctx.fillText(8 - i, this.drawBoardX + 2, this.drawBoardY + (i + 1) * this.pieceSize - this.pieceSize / 2);
            this.sc.ctx.fillText(String.fromCharCode('a'.charCodeAt(0) +  i), this.drawBoardX + (i) * this.pieceSize + 3, this.drawBoardY + 12);
         }else{
            this.sc.ctx.fillText(i + 1, this.drawBoardX + 2, this.drawBoardY + (i + 1) * this.pieceSize - this.pieceSize / 2);
            this.sc.ctx.fillText(String.fromCharCode('a'.charCodeAt(0) +   7 - i), this.drawBoardX + (i) * this.pieceSize + 3, this.drawBoardY + 12);
         }
      }
   }

   CanvasGameBoard.prototype.normalizePoint = function(sqr){
      var self = this;
      return {
         x: sqr.x - self.sc.canvas.offsetLeft - self.drawBoardX,
         y: sqr.y - self.sc.canvas.offsetTop - self.drawBoardY
      };
   }

   CanvasGameBoard.prototype.drawCaptured = function(){
      var self = this;

      var row = 1;
      var capAry = this.perspective === 'white' ? this.whiteCaptured : this.blackCaptured;
      for(var i = 0 ; i < capAry.length; i++){//draw own captured
         this.drawPieceAt(capAry[i].name, Utils.otherTeam(this.perspective), this.pieceSize * (i % 4), this.pieceSize * (8 - row));
         if((i + 1) % 4 === 0){
            row++;
         }
      }

      var capAry = this.perspective === 'white' ? this.blackCaptured : this.whiteCaptured;
      row = 0;
      for(var i = 0 ; i < capAry.length; i++){//draw other team's captured
         this.drawPieceAt(capAry[i].name, this.perspective, this.pieceSize * (i % 4), this.pieceSize * (row));
         if((i + 1) % 4 === 0){
            row++;
         }
      }
   }

   CanvasGameBoard.prototype.drawPieceAt = function(piece, color, x, y){
      var pieces = {
         'P':0,
         'B':1,
         'N':2,
         'R':3,
         'Q':4,
         'K':5
      };

      var colors = {
         'white':0,
         'black':1
      };

      var self = this;
      this.loadImage('img/sprite.png', function(img){
         //img, src.x, src.y, width, height, (<- from sprite)
         //dest.x, dest.y, width, height     (<- drawing to board)
         self.sc.ctx.drawImage(img, 64 * pieces[piece], colors[color] * 64, 64, 64, x, y, self.pieceSize, self.pieceSize);
      });
   }

   /*
    * Draw some stats of the game on the rhs of the canvas
    */
   CanvasGameBoard.prototype.drawStats = function(){
      var fontsize = this.pieceSize / 4; //approximate this
      this.sc.ctx.font = fontsize + 'px Arial';
      this.sc.ctx.fillStyle = BLACK;

      var leftMargin = 10;
      
      var movestr = []
      var tempMoves = Utils.deepCopyAry(this.moves);
      while(tempMoves.length > 0){
         movestr.push([tempMoves.shift(),tempMoves.shift()]);
      }
      for(var i = 0; i < movestr.length; i++){
         this.sc.ctx.fillText(movestr[i][0], leftMargin + this.pieceSize * 8 + this.drawBoardX, i * fontsize + this.pieceSize );
         if(movestr[i][1]){
            this.sc.ctx.fillText(movestr[i][1], leftMargin + this.pieceSize * 8 + this.drawBoardX + this.pieceSize, i * fontsize + this.pieceSize);
         }
      }
   }

   /*
    * Draw messages for the user just above the moves
    */
   CanvasGameBoard.prototype.drawGameAlert = function(msg){
      var fontsize = this.pieceSize / 3; //approximate this
      this.sc.ctx.font = fontsize + 'px Arial';
      this.sc.ctx.fillStyle = BLACK;
      var leftmargin = 10;
      var topmargin = this.pieceSize / 4;
      this.sc.ctx.fillText(msg, leftmargin + this.pieceSize * 8 + this.drawBoardX, topmargin);
   }

   /*
    * Draws a red square under the last move made by either side.
    */
   CanvasGameBoard.prototype.drawLastMove = function(){
      if(this.moves.length > 0){
         this.sc.ctx.fillStyle = this.highlightColor;
         var move = '';
         move = this.moves[this.moves.length - 1];
         if(move !== 'O-O-O' && move !== 'O-O'){
            move = move.slice(move.indexOf('-') + 1, move.length);
            if(this.perspective === 'black'){
               move = Utils.flipCoord(move);
            }
            var coord = Utils.pgnSqrToCoords(move);
            this.sc.ctx.fillRect(this.drawBoardX + this.pieceSize * coord.x, this.drawBoardY + this.pieceSize * (7 - coord.y), this.pieceSize, this.pieceSize);
         }else{//draw the castle squares
            var col1, col2, row;
            if(this.perspective === 'white'){
               if(Utils.otherTeam(this.turn) === 'white'){
                  row = 7; //bottom row is actually 7 from a graphics perspective
                  if(move === 'O-O'){//white Kingside from white's perspective
                     col1 = 5;
                     col2 = 6;
                  }else{//white Queenside from white's perspective
                     col1 = 2;
                     col2 = 3;
                  }
               }else{//Black has castled from white's perspective
                  row = 0;
                  if(move === 'O-O'){//black Kingside from white's perspective
                     col1 = 5;
                     col2 = 6;
                  }else{//black Queenside from white's perspective
                     col1 = 2;
                     col2 = 3;
                  }
               }
            }else{//Black Castle
               if(Utils.otherTeam(this.turn) === 'white'){
                  row = 0; //top row
                  if(move === 'O-O'){//white Kingside from black's perspective
                     col1 = 1;
                     col2 = 2;
                  }else{//white Queenside from blacks's perspective
                     col1 = 4;
                     col2 = 5;
                  }
               }else{//Black has castled from blacks's perspective
                  row = 7;
                  if(move === 'O-O'){//black Kingside from white's perspective
                     col1 = 1;
                     col2 = 2;
                  }else{//black Queenside from white's perspective
                     col1 = 4;
                     col2 = 5;
                  }
               }

            }
            this.sc.ctx.fillRect(this.drawBoardX + this.pieceSize * col1, this.drawBoardY + this.pieceSize * row, this.pieceSize, this.pieceSize);
            this.sc.ctx.fillRect(this.drawBoardX + this.pieceSize * col2, this.drawBoardY + this.pieceSize * row, this.pieceSize, this.pieceSize);
         }
      }
   }

   /*
    * Checks for check / stale / mate
    */
   CanvasGameBoard.prototype.pickAndDrawGameAlert = function(){
      var msg = this.turn + "'s move.";
      
      if(this.isCheckMateForTeam(this.turn).checkmate){
         msg = 'Checkmate! (' + this.turn + ')';
      }else if(this.whiteCheck){
         msg = 'Check! (White)';
      }else if(this.blackCheck){
         msg = 'Check! (Black)';
      }

      this.drawGameAlert(msg);
   }

   return CanvasGameBoard;
});
