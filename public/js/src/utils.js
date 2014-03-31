/*
 * EcmaScript 5+ inhertience
 */
function extend(parent, child){
   child.prototype = Object.create(parent.prototype);
   child.prototype.constructor = child;
}
