var request = require('request');
var pg = require('pg');

var conString = "postgres://jon:newdata@data-structures.codsfuble2ua.us-west-2.rds.amazonaws.com:5432/postgres";



//set up the path to Wunderground API
//var THEKEY = process.env.WAPI_KY;
var THEKEY = "8f58d587a80fcadc";
var wunderURL = "http://api.wunderground.com/api/" + THEKEY + "/astronomy/conditions/q/11231.json";

//this will count each request to log in the colsole (so I know it is all happening)
request(wunderURL, function (error, response, body) {
  if (!error && response.statusCode == 200) {
 var theInfo = JSON.parse(body);
var illumin = theInfo.moon_phase.percentIlluminated;
var age = theInfo.moon_phase.ageOfMoon;
var phase = theInfo.moon_phase.phaseofMoon;
var hemisphere = theInfo.moon_phase.hemisphere;
var nowunix = new Date();
var nowtime = nowunix.getTime() / 1000;
 var timekey = nowtime - (nowtime % 300);
 var querystring = timekey + ",DEFAULT," + illumin + "," + age + ",'" + phase + "','" + hemisphere + "'";
 console.log(querystring);
 //connect to database
      pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query("INSERT INTO moonlog VALUES ("+ querystring + ");", function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        console.log(result);
    });

  });

}  else {console.error('request failed')}
});
