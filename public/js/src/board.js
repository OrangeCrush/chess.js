define(function(require, exports, module){
   var Utils = require('Utils');
   var Piece = require('Piece');
 /*
  * [0][0] will correspond to 1A (White Perspective)
  * [7][7] will then correspond to 8H
  */
   function Board(init){
      this.clearBoard();
   }

   Board.prototype.clearBoard = function(){
      this.squares = new Array(8);
      for(var i = 0 ; i < 8; i++){
         this.squares[i] = new Array(8);
         for(var j = 0; j < 8; j++){
            this.squares[i][j] = {
               occupied: false,
               piece: null,
               x: i,
               y: j
            };              
         }
      }
   }

   Board.prototype.newGame = function(){
      this.clearBoard();
   }

   Board.prototype.toString = function(){
      var rval = '\n';
      for(var i = 7; i >= 0; i--){
         for(var j = 0; j < 8; j++){
            if(this.squares[j][i].occupied){
               rval += this.squares[j][i].piece.toString() + ' ';
            }else{
               rval += '  ';
            }
         }
         rval += '\n';
      }
      return rval;
   }

   Board.prototype.toHtmlTable = function(){
      var html = '<table>\n' + 
         '<thead>\n' + 
         '<tr>\n' + 
         '<th></th> \n' + 
         '<th>a</th> \n' + 
         '<th>b</th> \n' + 
         '<th>c</th> \n' + 
         '<th>d</th> \n' + 
         '<th>e</th> \n' + 
         '<th>f</th> \n' + 
         '<th>g</th> \n' + 
         '<th>h</th> \n' + 
         '</tr>\n' + 
         '</thead>\n' + 
         '<tbody>';
      for(var i = 7; i >= 0; i--){
         html += '<tr>\n';
         html += '<td><b>' + (i + 1) + '</b></td>\n';
         for(var j = 0; j < 8; j++){
            if(this.squares[j][i].occupied){
               if(this.squares[j][i].piece.color === 'black'){
                  html += '<td><b>' + this.squares[j][i].piece.toString() + '&nbsp;</b></td>';
               }else{
                  html += '<td>' + this.squares[j][i].piece.toString() + '&nbsp;</td>';

               }
            }else{
               html += '<td>&nbsp;&nbsp</td>';
            }
         }
         html += '</tr>\n';
      }
      return html + '</tbody>\n</table>';
   }
   return function(){
      return Board;
   }
});
