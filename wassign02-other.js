var fs = require('fs');
var cheerio = require('cheerio');

var fileContent = fs.readFileSync('/home/ubuntu/workspace/data/aameetinglist02M.txt');

var $ = cheerio.load(fileContent);

$('table[cellpadding=5]').each(function(i,elem){
  $(elem).find('h4').each(function(i,elem){
     $(elem).nextAll('b').each(function(i,elem){
         var theFollowingObject = $(elem).next(); 
         var theAddress = theFollowingObject[0].next.data;
     console.log(theAddress.trim());
});
});
});