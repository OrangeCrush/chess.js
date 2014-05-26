require.config({
   paths:{
      Game: 'src/game',
      Board: 'src/board',
      Piece: 'src/piece',
      Utils: 'src/utils',
      CanvasGameBoard: 'src/canvasGameBoard',
      SingletonContainer: 'src/singletonContainer',
   },
   shim:{
      Game:{
         exports: 'Game',
         deps:['Board', 'Utils']
      },
      Board:{
         exports: 'Board',
         deps:['Piece', 'Utils']
      },
      Piece:{
         exports: 'Piece',
         deps:['Utils']
      },
      CanvasGameBoard:{
         exports: 'CanvasGameBoard',
         deps:['Game']
      },
      Utils:{
         exports: 'Utils'
      }

   }
});
require(['socket.io.min', 'CanvasGameBoard'], function(socket, CanvasGameBoard){
   var socket = io.connect('http://192.168.1.132:3000');
   var canvasGame;

   //Cute little period animation
   var count = 0;
   var waitTextel = document.getElementById('textAnimation');
   var orig = waitTextel.innerHTML;
   var periodPid = setInterval(function(){
      if(++count % 6 !== 0){
         waitTextel.innerHTML += '.';
      }else{
         waitTextel.innerHTML = orig;
         count = 0; //dont want overflows now do we
      }
   },500);

   socket.on('startGame', function(data){
      clearInterval(periodPid);
      var canvas = document.getElementsByTagName('canvas')[0];
      canvas.style.display = '';
      document.getElementById('waitingScreen').style.display = 'none';

      gameId = data.gameId;
      canvasGame = new CanvasGameBoard({
         canvas: canvas,
         perspective: data.color,
         /*
          * This gets called when the user makes a move..
          */
         moveCallBack: function(move){
            socket.emit('move',{
               id: gameId,
               color: move.color,
               pgnMove: move.pgn
            });
         }
      });
   });

   /*
    * Display the new move
    */
   socket.on('newMove', function(data){
      if(canvasGame.perspective !== data.color){
         canvasGame.processMove(data.pgnMove, data.color);
         canvasGame.redrawGame();
      }
   });

   socket.on('badMove', function(data){
     //RollBack state of game and display a message promptly yelling       at the user
     console.log('Bad move detected');
   });

   socket.on('closingRoom', function(data){
      //Idk what to do yet really  
   });
});
