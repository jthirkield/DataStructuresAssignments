var pg = require('pg');

var conString = "postgres://jon:newdata@data-structures.codsfuble2ua.us-west-2.rds.amazonaws.com:5432/postgres";

var five = require("johnny-five"),
  board, photoresistor;

board = new five.Board();

var nowunix = new Date();
var nowtime = nowunix.getTime() / 1000;
 var timekey = nowtime - (nowtime % 300);

board.on("ready", function startLog() {

  // Create a new `photoresistor` hardware instance.
  photoresistor = new five.Sensor({
    pin: "A2",
    freq: 1000
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pot: photoresistor
  });

  // "data" get the current reading from the photoresistor
  photoresistor.on("data", function() {
  var theLight =  this.value;
      pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query("INSERT INTO nightlight VALUES (" + timekey + ",DEFAULT," + theLight + ");", function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        console.log(result);
    });

  });

    console.log(timekey + "," + theLight);
  });
});