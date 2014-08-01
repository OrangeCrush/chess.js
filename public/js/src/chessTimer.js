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
      if(!init){
         throw "Please provide an init parameter to ChessTimer, even if it is {}.";
      }
      this.blackTime = init.startTime;
      this.whiteTime = init.startTime;
      this.delay = init.delayTime
      this.onTimerTick = init.onTimerTick;
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
            if(self.turn === 'white' && self.whiteTime > 0){
               self.whiteTime--;    
            }else if(self.turn === 'black' && self.blackTime > 0){
               self.blackTime--;
            }
         }
         if(self.onTimerTick){//callback for ticks of the timer (useful for callbacks)
            self.onTimerTick();
         }
      }, 1000);
   }

   ChessTimer.prototype.click = function(){
      clearInterval(this.timerpid);
      this.turn = Utils.otherTeam(this.turn);
      this.start();
   }

   /*
    * whitetime : blacktime
    */
   ChessTimer.prototype.toString = function(){
      return Math.floor(this.whiteTime / 60) + ':' + Utils.padZero(this.whiteTime % 60) + '    ' + Math.floor(this.blackTime / 60) + ':' + Utils.padZero(this.blackTime % 60);
   }

   return function(){
      return ChessTimer;
   };
});
