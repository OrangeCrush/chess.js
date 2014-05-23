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
   var socket = io.connect('http://localhost:3000');
   var canvasGame;
   var gameId;
   socket.on('startGame', function(data){
      gameId = data.gameId;
      canvasGame = new CanvasGameBoard({
         canvas: document.getElementsByTagName('canvas')[0],
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
});
