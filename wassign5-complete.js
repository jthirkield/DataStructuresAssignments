// QUERY MONGODB

var dbName = 'aameetings';
var collName = 'meetings';
var niceResults = [];
var daysofWeek = ['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'];

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient;

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
        { $match : { "totalDay": { $gte: 4020, $lt: 4740} } },
        //THIS SORTS BY TIME -- EARIEST FIRST
        { $sort : {"totalDay" : 1}}
       ]).toArray(function(err, docs) {
        if (err) {console.log(err)}
        
        else {
            niceResults = docs;
console.log(JSON.stringify(docs,null, 1));
        }
        db.close();
                  console.log("******************");
          console.log("FORMATTED RESULTS");

        for(var i = 0; i < niceResults.length;i++) {
          console.log("******************");
          console.log(niceResults[i].theMeeting);
          console.log("Day: " + daysofWeek[niceResults[i].eachMeeting.MeetingDay]);
          console.log("Start Time: " + makeHour(niceResults[i].eachMeeting.startHour) + ":" + makeMinute(niceResults[i].eachMeeting.startMinute) + " " + makeAM(niceResults[i].eachMeeting.startHour));
          console.log("End Time: " + makeHour(niceResults[i].eachMeeting.endHour) + ":" + makeMinute(niceResults[i].eachMeeting.endMinute) + " " + makeAM(niceResults[i].eachMeeting.endHour));
          console.log("Location: " + niceResults[i].locationName);
          console.log(niceResults[i].AddressLine1[0]);
          console.log(niceResults[i].AddressLine1[1]);
          console.log(niceResults[i].AddressLine2);
          if (niceResults[i].eachMeeting.MeetingType) {
          console.log("Meeting Type: " + niceResults[i].eachMeeting.MeetingType);
          }
          if (niceResults[i].eachMeeting.SpecialInterest) {
          console.log("SpecialInterest: " + niceResults[i].eachMeeting.SpecialInterest);
          }

          console.log("Additional Info: " + niceResults[i].meetingInfo);
        console.log("Geo Info: Lat=" + niceResults[i].latLong.lat + " Long=" + niceResults[i].latLong.lng);

        }

    });

}); //MongoClient.connect

function makeAM (theHour) {
    var AMPM = "AM";
    if (theHour >= 12) {
        AMPM = "PM";
    }
    return AMPM;
    
}
function makeMinute (theMinute) {
    if (theMinute < 10) {
        theMinute = "0" + theMinute;
    }
    return theMinute;
}

function makeHour (theHour) {
    if (theHour > 12) {
        theHour -= 12;
    }
    if (theHour == 0) {
        theHour = 12;
    }
    return theHour;
}