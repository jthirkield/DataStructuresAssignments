
var fs = require('fs');
//get and parse the JSON file from the assignment 3
var fileContent = fs.readFileSync('/home/ubuntu/workspace/data/aameetingsNewArray.txt');
var meetingsData = JSON.parse(fileContent);

//set up the url to the database
    var url = 'mongodb://' + process.env.IP + ':27017/aameetings';

    //require Mongo!!
    var MongoClient = require('mongodb').MongoClient; // npm install mongodb

    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);}
//I created a document called "meetings" inside the "aameetings" database
        var collection = db.collection('meetings');

        // put the meetings data we have into the database
        collection.insert(meetingsData);
         db.close();

    });
