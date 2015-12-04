var request = require('request');
var fs = require('fs');
var pg = require('pg');
var allweather;
var sensor;
var qTrack = 0;


var conString = "postgres://jon:mydatabase@data-structures.codsfuble2ua.us-west-2.rds.amazonaws.com:5432/postgres";


// var querystring = timekey + ",DEFAULT," + illumin + "," + age + ",'" + phase + "','" + hemisphere + "'";
 //console.log(querystring);
 //connect to database
      pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query("select * from nightlight where timekey=1449055200;", function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        //console.log(result);
       // sensor = result;
        theResults(result,1);
         fs.writeFileSync('/home/ubuntu/workspace/data/SensorJSON.txt', JSON.stringify(sensor, null, 1));
 //        var firstrow = sensor.rows[0].lightlevel;
// console.log(firstrow);

  
    });
      client.query("select * from weathobs where timekey=1449055200;", function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        //console.log(result);
        theResults(result,2);
       // allweather = result;
        fs.writeFileSync('/home/ubuntu/workspace/data/WeatherJSON.txt', JSON.stringify(allweather, null, 1));
  //      var firstrow = allweather.rows[0].weather;
    //    console.log(firstrow);
    });
  });
  
  
  function theResults(theObject, num) {
    if (num == 2) {
       allweather = theObject;
       qTrack++;
    } else {
      sensor = theObject;
       qTrack++;
    }
    if (qTrack == 2) {
      console.log(allweather.rows[0].weather);
      console.log(sensor.rows[0].lightlevel);
    }
  }