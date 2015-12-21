var request = require('request');
var fs = require('fs');
var pg = require('pg');
var allweather;
var sensor;
var qTrack = 0;

//THE QUERY JOINS THE SENSOR AGGREGATE TABLES WITH THE WEATHER DATA
var conString = "postgres://jon:mydatabase@data-structures.codsfuble2ua.us-west-2.rds.amazonaws.com:5432/postgres";
var queryST = "SELECT weathobs.keytrue, weathobs.weather, visualize.avglight, visualize.minlight, visualize.maxlight FROM visualize, weathobs WHERE visualize.thiskey = weathobs.keytrue ORDER BY weathobs.keytrue;"

// var querystring = timekey + ",DEFAULT," + illumin + "," + age + ",'" + phase + "','" + hemisphere + "'";
 //console.log(querystring);
 //connect to database
      pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query(queryST, function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        //console.log(result);
       // sensor = result;
         fs.writeFileSync('/home/ubuntu/workspace/data/Sensor2JSON.txt', JSON.stringify(result, null, 1));
console.log("Done");

  
    });
});
  
  
