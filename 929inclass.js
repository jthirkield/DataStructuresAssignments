var request = require('request'); // npm install request
var async = require('async'); // npm install async
var fs = require('fs');
// SETTING ENVIRONMENT VARIABLES (in Linux): 
// export NEW_VAR="Content of NEW_VAR variable"
// printenv | grep NEW_VAR
var apiKey = process.env.API_KEY;

var meetingsData = [];
var addresses = JSON.parse(fs.readFileSync('/home/ubuntu/workspace/data/meetingsArray.txt'));

function fixAddresses (oldAddress) {
    var newAddress = oldAddress.substring(0, oldAddress.indexOf(',')) + ", New York, NY";
    return newAddress;
}

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + fixAddresses(value).split(' ').join('+') + '&key=' + apiKey;
    var thisMeeting = new Object;
    thisMeeting.address = value;
    request(apiRequest, function(err, resp, body) {
        if (err) {throw err;}
        thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
        thisMeeting.formattedAddress = fixAddresses(value);
        meetingsData.push(thisMeeting);
    });
    setTimeout(callback, 2000);
}, function() {
    console.log(meetingsData);
});