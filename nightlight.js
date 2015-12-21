var request = require('request');
var fs = require('fs');
var pg = require('pg');
var allweather;
var sensor;
var qTrack = 0;


var conString = "postgres://jon:mydatabase@data-structures.codsfuble2ua.us-west-2.rds.amazonaws.com:5432/postgres";
var queryST = "SELECT weathobs.keytrue, weathobs.weather, visualize.avglight, visualize.minlight, visualize.maxlight FROM visualize, weathobs WHERE visualize.thiskey = weathobs.keytrue ORDER BY weathobs.keytrue;"
var viztop = fs.readFileSync('/home/ubuntu/workspace/pages/vizTop.html');
// var data2 = fs.readFileSync(__dirname + '/index2.html');
var vizbottom = fs.readFileSync('/home/ubuntu/workspace/pages/vizBottom.html');

var http = require('http');

var server = http.createServer(function(req, res) {

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
            res.writeHead(200, {'content-type': 'text/html'});
            res.write(viztop);
            res.write('var sensorStuff = [' + JSON.stringify(result) + '];');
            res.end(vizbottom);
            res.end();
  
    });
});
  
});

server.listen(process.env.PORT);
