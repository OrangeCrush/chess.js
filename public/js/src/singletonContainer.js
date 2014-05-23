define(function(require, exports, module){
   /*
    * Since the deep copy algorithm I wrote
    * doesn't handle ciruclar references
    * I need to make sure that I wrap canvas, image, etc into
    * this.  Kind of a hack. idk what else to do.
    */
   return function SingletonContainer(init){
      for(var key in init){
         this[key] = init[key]
      }
   }
});
