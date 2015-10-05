var fs = require('fs');
var cheerio = require('cheerio');

var fileContent = fs.readFileSync('/home/ubuntu/workspace/data/aameetinglist02M.txt');

var $ = cheerio.load(fileContent);

var meetings = [];

//console.log($('table').length); // checks the length of the thing
$('table[cellpadding=5]').find('tbody').find('tr').each(function(i,elem){
    meetings.push($(elem).find('td').eq(0).html().split('<br>')[2].trim());
});

console.log(meetings);