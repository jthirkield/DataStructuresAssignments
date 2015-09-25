var request = require('request');
var async = require('async');
var fs = require('fs');
var cheerio = require('cheerio');
//GET THE HTML PAGE THAT I'VE DOWNLOADED
var fileContent = fs.readFileSync('/home/ubuntu/workspace/data/aameetinglist02M.txt');
var $ = cheerio.load(fileContent);

//SET UP TWO ARRAYS -- FIRST FOR THE ADDRESSES, THEN FOR THE OBJECTS WITH LONG/LAT
var meetings = [];
var meetingsInfo = [];

//console.log($('table').length); // checks the length of the thing
$('table[cellpadding=5]').find('tbody').find('tr').each(function(i,elem){
    var theAddress = $(elem).find('td').eq(0).html().split('<br>')[2].trim();
    var shortAddress = theAddress.substring(0, theAddress.indexOf(','));
    var fullAddress = shortAddress + ", New York, NY";
    meetings.push(fullAddress);
});


//got everything in an array now on to GOOGLEMAPS
//big question -- is this program waiting for everything above to happen
//before going to GOOGLE? Is "readFileSync" controlling that? Or am I just lucky?

//set up the path to Google's API
var THEKEY = "&key=" + process.env.API_KEY;
var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=";

//this will count each request to log in the colsole (so I know it is all happening)
var countRequests = 1;
//start going to Google here
async.eachSeries(meetings, function(value,callback){
    var theInfo = new Object;
     theInfo.address = value;
//Get the url together
    var addressString = value.split(' ').join('+');
    var meetingURL = googleURL + addressString + THEKEY;
//Log each request in the console so I don't get impatient...
   console.log("Request" + countRequests++ + "...");
request(meetingURL, function (error, response, body) {
  if (!error && response.statusCode == 200) {
 theInfo.latLong = JSON.parse(body).results[0].geometry.location;
 meetingsInfo.push(theInfo);
}  else {console.error('request failed')}
});
    setTimeout(callback, 2500);
}, function(){
 fs.writeFileSync('/home/ubuntu/workspace/data/aameetingsMapArray.txt', JSON.stringify(meetingsInfo, null, 1));
    console.log("all done: the object was written to the file -- data/aameetingsMapArray.txt");
//below to test that the array of objects come out right -- being written to the file above.
 //  console.log(meetingsInfo);
});
