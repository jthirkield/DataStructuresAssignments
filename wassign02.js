var fs = require('fs');
var cheerio = require('cheerio');

var fileContent = fs.readFileSync('/home/ubuntu/workspace/data/aameetinglist02M.txt');

var $ = cheerio.load(fileContent);

$('table[cellpadding=5]').each(function(i,elem){
  $(elem).find('h4').each(function(i,elem){
      var badhtml = $(elem).parent('td');
    var arrayHtml = badhtml.text().split('\n');
     console.log(arrayHtml[3].trim());
});
});