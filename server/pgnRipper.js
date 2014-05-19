var fs = require('fs');

process.argv.slice(2, process.argv.length).forEach(function(val, index, array){
   fs.readFile(val, {encoding: 'utf-8'}, function(err, data){
      var pgns = [];
      var keep = '';
      if(err){
         console.log(err);
         return;
      }else{
         data = data.split('\n');
         for(var line in data){
            if(data[line].match(/^[1-9]/)){
               keep += data[line].trim();
            }else if(keep !== ''){
               pgns.push(keep);
               keep = '';
            }
         }
      }
      console.log(pgns);
   });
});


