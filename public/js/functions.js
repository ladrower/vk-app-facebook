/* 
 * EcmaScript core functions implementation
 * 
 */


/*
 * JavaScript 1.8.5 fun.bind implementation
 * ECMAScript 5th Edition
 * fun.bind(thisArg[, arg1[, arg2[, ...]]])
 */ 
if (!Function.prototype.bind) {
   Function.prototype.bind = function() { 
      var fn = this, 
         args = Array.prototype.slice.call(arguments),
         object = args.shift(); 
      return function(){ 
         return fn.apply(object, 
            args.concat(Array.prototype.slice.call(arguments))); 
      }; 
   };
}

function extend(obj1, obj2){
  for (var i in obj2) {
    if (obj1[i] && typeof(obj1[i]) == 'object') {
      extend(obj1[i], obj2[i])
    } else {
      obj1[i] = obj2[i];
    }
  }
}

function shuffle(myArray) {
  var i = myArray.length;
  if ( i == 0 ) return myArray;
  while ( --i ) {
     var j = Math.floor( Math.random() * ( i + 1 ) );
     var tempi = myArray[i];
     var tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
   }
   return myArray;
}

if (!String.prototype.trim) {
    String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
    String.prototype.ltrim=function(){return this.replace(/^\s+/,'');}
    String.prototype.rtrim=function(){return this.replace(/\s+$/,'');}
    String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');}
}