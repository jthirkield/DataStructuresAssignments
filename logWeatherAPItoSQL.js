var request = require('request');
var async = require('async');
var fs = require('fs');
var meetings = [];
//set the number of queries overnight (12 an hour)
for (var i=0; i < 144; i++) {
    meetings[i] = 1;
}
var weatherInfo = [];
var pg = require('pg');

var conString = "postgres://jon:newdata@data-structures.codsfuble2ua.us-west-2.rds.amazonaws.com:5432/postgres";



//set up the path to Wunderground API
//var THEKEY = process.env.WAPI_KY;
var THEKEY = "8f58d587a80fcadc";
var wunderURL = "http://api.wunderground.com/api/" + THEKEY + "/geolookup/conditions/q/11231.json";

//this will count each request to log in the colsole (so I know it is all happening)
var countRequests = 1;
//start going to Google here
async.eachSeries(meetings, function(value,callback){
 //Get the url together
//Log each request in the console so I don't get impatient...
   console.log("Request" + countRequests++ + "...");
request(wunderURL, function (error, response, body) {
  if (!error && response.statusCode == 200) {
 var theInfo = JSON.parse(body);
 var location = theInfo.current_observation.observation_location.city;
 var locLat = theInfo.current_observation.observation_location.latitude;
 var locLong = theInfo.current_observation.observation_location.longitude;
 var obsTime = theInfo.current_observation.observation_time_rfc822;
 var obsEpoch = theInfo.current_observation.observation_epoch;
 var weather = theInfo.current_observation.weather;
 var temp_f = theInfo.current_observation.temp_f;
 var wind = "empty";
 var wind_dir = theInfo.current_observation.wind_dir;
 var wind_mph = theInfo.current_observation.wind_mph;
 var pressure_in = theInfo.current_observation.pressure_in;
 var visibility_mi = theInfo.current_observation.visibility_mi;
 var visibility_km = theInfo.current_observation.visibility_km;
 var precip_1hr_in = theInfo.current_observation.precip_1hr_in;
 var nowunix = new Date();
var nowtime = nowunix.getTime() / 1000;
 var timekey = nowtime - (nowtime % 300);
 var querystring = timekey + ",DEFAULT,'" + location + "'," + locLat + "," + locLong + ",'" + obsTime + "'," + obsEpoch + ",'" + weather + "'," + temp_f + ",'" + wind + "','" + wind_dir + "'," + wind_mph + "," + pressure_in + "," + visibility_mi + "," + visibility_km + "," + precip_1hr_in;
console.log(querystring);
//connect to database
      pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query("INSERT INTO weathobs VALUES ("+ querystring + ");", function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        console.log(result);
    });

  });

 weatherInfo.push(querystring);
}  else {console.error('request failed')}
});
 //   setTimeout(callback, 2500);
   setTimeout(callback, 300000);
}, function(){
 fs.writeFileSync('/home/ubuntu/workspace/data/weatherArray2.txt', weatherInfo);
    console.log("all done: the object was written to the file -- data/weatherArray.txt");
//below to test that the array of objects come out right -- being written to the file above.
 //  console.log(meetingsInfo);
});
