// IN THE MONGO SHELL: 
//   CREATE DATABASE citibike AND SWITCH TO IT WITH: 
//      use citibike
//   CREATE COLLECTION stations WITH: 
//      db.createCollection('stations')

var request = require('request');
var fs = require('fs');

var fileContent = fs.readFileSync('/home/ubuntu/workspace/data/aameetingsMapArray.txt');
var meetingsData = JSON.parse(fileContent);

//    Connection URL
    var url = 'mongodb://' + process.env.IP + ':27017/aameetings';

    // Retrieve
    var MongoClient = require('mongodb').MongoClient; // npm install mongodb

    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);}

        var collection = db.collection('meetings');

        // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
        collection.insert(meetingsData);
  //      for (var i=0; i < stationData.stationBeanList.length; i++) {
  //          collection.insert(stationData.stationBeanList[i]);
  //          }
        db.close();

    }); //MongoClient.connect
