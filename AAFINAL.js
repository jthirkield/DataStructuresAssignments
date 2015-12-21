// QUERY MONGODB

var fs = require('fs');

var maptop = fs.readFileSync('/home/ubuntu/workspace/pages/mapTop.html');
// var data2 = fs.readFileSync(__dirname + '/index2.html');
var mapbottom = fs.readFileSync('/home/ubuntu/workspace/pages/mapBottom.html');

var http = require('http');

var dbName = 'aameetings';
var collName = 'meetings';
// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient;

var server = http.createServer(function(req, res) {
    var dt = new Date();
//var unixtime = dt.getTime() - 18000000;
//var ds = new Date(unixtime);
var today= dt.getDay();
var nowHour = dt.getHours() - 5;
if (nowHour < 0) {
    today = today - 1;
    nowHour = 24 + nowHour;
} 
var nowMins = dt.getMinutes();
var startsearch = (1440 * today) + (60 * nowHour) + nowMins;
var endsearch = (1440 * (today+1) + (60 * 4));

    

MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}

    var collection = db.collection(collName);

    collection.aggregate([
        //THIS GETS ALL OF THE EMBEDDED OBJECTS OF THE MEETING TIMES OUT THEIR BEDS
        { $unwind : "$eachMeeting" },
        //THIS SETS UP A VARIABLE "TOTALDAY" THAT ADDS THE AMOUNT OF MINUTES FROM SUNDAY AT MIDNIGHT FOR COMPARISION
        //IN $PROJECT I HAVE TO EXPLICITLY NAME ALL THE FIELDS I WANT INCLUDED
        { $project : { _id: 0, locationName: 1, theMeeting : 1 ,  AddressLine1: 1, AddressLine2 : 1, meetingInfo: 1,  wheelchair: 1, latLong: 1, eachMeeting: 1,
            "totalDay" : {
                $add: [{"$multiply" : [1440, "$eachMeeting.MeetingDay"]}, {"$multiply" : [60, "$eachMeeting.startHour"]}, "$eachMeeting.startMinute"]
            }
        }},
        //THIS MATCHES MEETINGS FROM TUESDAY AT 7PM TO WEDNESDAY AT 7AM
        { $match : { "totalDay": { $gte: startsearch, $lt: endsearch} } },
        //THIS SORTS BY TIME -- EARIEST FIRST
        { $sort : {"totalDay" : 1}},
        { $group : {  _id : { 
            theMeeting : "$theMeeting",
            locationName : "$locationName",
            AddressLine1 : "$AddressLine1",
            AddressLine2 : "$AddressLine2",
            meetingInfo : "$meetingInfo",
            wheelchair : "$wheelchair",
            latLong : "$latLong"
        }, 
            MeetingDay : { $push : "$eachMeeting.MeetingDay" },
            startHour : { $push : "$eachMeeting.startHour" },
            startMinute : { $push : "$eachMeeting.startMinute" },
            endHour : { $push : "$eachMeeting.endHour" },
            endMinute : { $push : "$eachMeeting.endMinute" },
            meetingType : { $push : { $ifNull: [ "$eachMeeting.MeetingType", "Unspecified" ] } },
            specialInterest : { $push : { $ifNull: [ "$eachMeeting.SpecialInterest", "Unspecified" ] } }
        }},
        { $group : { _id : { latLong : "$_id.latLong" }, 
                    meetingGroups : { $addToSet : {  meetingGroup : "$_id", 
                                                meetings : {
                                                meetingDays : "$MeetingDay",
                                                startHours : "$startHour",
                                                startMinutes : "$startMinute",
                                                endHours : "$endHour",
                                                endMinutes : "$startMinute",
                                                endTimes : "$endMinute",
                                                theMeetingTypes : "$meetingType",
                                                theSpecialInterest : "$specialInterest"
                                                }
                    } }
                    } }

       ]).toArray(function(err, docs) {
        if (err) {console.log(err)}
        
        else {
        //    niceResults = docs;
//console.log(JSON.stringify(docs,null, 1));
//fs.writeFileSync('/home/ubuntu/workspace/data/aaMONGORESULTS.txt', JSON.stringify(docs, null, 1));
        
                  res.writeHead(200, {'content-type': 'text/html'});
            res.write(maptop);
            res.write('var meetings = ' + JSON.stringify(docs) + ';');
            res.end(mapbottom);
            res.end();
        }
 
        db.close();
                  console.log("******************");
          console.log("FORMATTED RESULTS");
          console.log(":" + ":" + today + ":" + nowHour + ":" + nowMins);
          console.log(startsearch + ":" + endsearch);

 
    });

}); //MongoClient.connect

});

server.listen(process.env.PORT);
