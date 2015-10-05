var async = require('async');

var names = ["alex","betsy","chris","diana"];

async.eachSeries(names, function(value,callback){
    console.log(value);
    setTimeout(callback, 2500);
}, function(){
    console.log("all done now");
});

//function y () {
//    console.log("why")
//}

//setTimeout(y, 5000);
