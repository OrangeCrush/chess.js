/*
 * Encapsulates a chess-timer funtionality
 *
 * Every chess timer should have 
 * start / click
 * start will start a game (white's timer)
 * and click will shift the timer to black ..then white.. etc
 */

define(function(require, exports, module){
   var Utils = require('Utils');
   function ChessTimer(init){
      this.blacktime = init.startTime;
      this.whitetime = init.startTime;
      this.delay = init.delayTime
      this.turn = 'white';
   }

   /*
    * The default timer will be a straight delay of delayTime
    */
   ChessTimer.prototype.start = function(){
      var count = 0;
      var self = this;
      this.timerpid = setInterval(function(){
         if(++count > self.delay){//This is where the delay is implemented
            if(self.turn === 'white'){
               self.whitetime--;    
            }else{
               self.blacktime--;
            }
         }
      }, 1000);
   }

   ChessTimer.prototype.click = function(){
      clearInterval(this.timerpid);
      this.turn = Utils.otherTeam(this.turn);
      this.start();
   }
});
