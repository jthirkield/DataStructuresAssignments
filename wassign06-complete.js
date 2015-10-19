var request = require('request');
var async = require('async');
var fs = require('fs');
var cheerio = require('cheerio');

var fileContent = fs.readFileSync('/home/ubuntu/workspace/data/aameetinglist02M.txt');

var $ = cheerio.load(fileContent);
var meetingTimes = [];
var allTheMeetings = [];

$('table[cellpadding=5]').find('tbody').find('tr').each(function(i,elem){
 var theInfo = new Object;
    theInfo.locationName  = $(elem).find('td').eq(0).find('h4').text();
    theInfo.theMeeting = cleanMeeting($(elem).find('td').eq(0).find('b').text());
   
    //theMeeting = cleanMeeting(theMeeting);
   // console.log(theMeeting);
    //must be split into address and detail at , or ( maybe other special chars
  theInfo.AddressLine1 = cleanAddress($(elem).find('td').eq(0).html().split('\n')[3].trim());
  //var theAddress1clean = cleanAddress(AddressLine1);
  //console.log(AddressLine1)
 //must be split into zip code and detail2
     var theAddress2 = $(elem).find('td').eq(0).html().split('\n')[4].trim();
     var theZip = theAddress2.substr(theAddress2.length-5,theAddress2.length);
     if (!theZip.match(/100\d\d/)) {
      theZip = " ";
     }
     //clean up the other Address;
     theInfo.AddressLine2 = clean2Address(theAddress2);
          theInfo.zip = theZip;

   //console.log(theAddress2 + "|| " + theZip);
      theInfo.meetingInfo = $(elem).find('td').eq(0).find('div').text().trim();
      var wheelchair = "";
      wheelchair = $(elem).find('td').eq(0).find('span').text().trim();
     if (wheelchair == "") {
     theInfo.wheelchair = false;
     } else {
      theInfo.wheelchair = true;
     }

    //console.log(locationName);
    //console.log(meetingInfo);
      //  console.log(wheelchair);
      var theTimes = $(elem).find('td').eq(1).html().trim();
      theTimes = theTimes.replace(/>\s*/g,">").replace(/\s*</g,"<");
      meetingTimes = theTimes.split("<br><br>");
     // console.log(meetingTimes);
     var allMeetingsTimes = [];
      for (var i=0; i < meetingTimes.length-1; i++) {
          var oneMeetingTime = meetingTimes[i].split("b>");
        var theMeetingDay = oneMeetingTime[1].substr(0, oneMeetingTime[1].indexOf(' From'));
         if (theMeetingDay.match(/^sun+|^mon+|^tues+|^wed+|^thurs+|^fri+|^sat+/i)) {
            
        var theMeeting = new Object;
             theMeeting.MeetingDay = cleanDay(theMeetingDay);
             //Meeting Time start is split into a time Array
             var startTime = cleanTimeArray(oneMeetingTime[2].substr(0, oneMeetingTime[2].indexOf('<')).trim());
             theMeeting.startHour = startTime[0];
             theMeeting.startMinute = startTime[1];
            // console.log(MeetingTimeStart);
            //Meeting Time end is split into a time Array
             var endTime = cleanTimeArray(oneMeetingTime[4].substr(0, oneMeetingTime[4].indexOf('<')).trim());
             theMeeting.endHour = endTime[0];
             theMeeting.endMinute= endTime[1];
           //  console.log(MeetingTimeEnd);
             if (oneMeetingTime[5]) {
              if (oneMeetingTime[5].substr(0,7) == "Meeting") {
               var MeetingType = oneMeetingTime[6];
              if (MeetingType.substr(MeetingType.length-5,MeetingType.length-1) == "<br><") {
               theMeeting.MeetingType = MeetingType.substr(0,MeetingType.length-5);
              }
              } else if (oneMeetingTime[5].substr(0,7) == "Special") {
                theMeeting.SpecialInterest = oneMeetingTime[6];
              } 
             }
             if (oneMeetingTime[7]) {
              if (oneMeetingTime[7].substr(0,7) == "Special") {
               theMeeting.SpecialInterest = oneMeetingTime[8];
              }
             }
             allMeetingsTimes.push(theMeeting);
      }
      }
     theInfo.eachMeeting = allMeetingsTimes;
                allTheMeetings.push(theInfo);
 
});

var THEKEY = "&key=" + process.env.API_KEY;
var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
//this will count each request to log in the colsole (so I know it is all happening)
var countRequests = 1;
async.eachSeries(allTheMeetings, function(value,callback){
 var latAddress = value.AddressLine1[0];
console.log(latAddress);
//Get the url together
    var addressString = latAddress.split(' ').join('+') + ",+New+York,+NY";
    var meetingURL = googleURL + addressString + THEKEY;
//Log each request in the console so I don't get impatient...
   console.log("Request" + countRequests++ + "...");
request(meetingURL, function (error, response, body) {
 if (!error && response.statusCode == 200) {
 value.latLong = JSON.parse(body).results[0].geometry.location;
}  else {console.error('request failed')}
});
   setTimeout(callback, 2000);
}, function(){
// fs.writeFileSync('/home/ubuntu/workspace/data/aameetingsMapArray.txt', JSON.stringify(meetingsInfo, null, 1));
fs.writeFileSync('/home/ubuntu/workspace/data/aameetingsNewArray.txt', JSON.stringify(allTheMeetings, null, 1));
    console.log("all done: the object was written to the file");

//below to test that the array of objects come out right -- being written to the file above.
 //  console.log(meetingsInfo);
});
//console.log(allTheMeetings);
// fs.writeFileSync('/home/ubuntu/workspace/data/aameetingsNewArray.txt', JSON.stringify(allTheMeetings, null, 1));


//HERE IS MY FUNCTION THAT GETS OUT THE NUMBER AND CHECKS BOTH SIDES OF THE NAME
function cleanAddress(addressLine) {
 //find first instance of either a comma or paren
 var firstCommaParen = addressLine.search(/[,\(]/);
var streetSide = addressLine.substr(0, firstCommaParen).trim();
var detailSide = addressLine.substr(firstCommaParen+1, addressLine.length).trim();
if (streetSide == "253 Center Street") {
 streetSide = "253 Centre Street";
}
//clean detail side
var clipSides = /(.*)[\W]$/;
detailSide = detailSide.replace(clipSides, "$1").trim();
detailSide = detailSide.replace(clipSides, "$1").trim()
return [streetSide,detailSide];
}

function clean2Address(addressLine) {
 //stripTags
addressLine = addressLine.replace("<br>","").trim();
//stripZip
addressLine = addressLine.replace(/100\d\d$/,"").trim();
//stripNY
addressLine = addressLine.replace("NY","").trim();
//strip()
addressLine = addressLine.replace(/^\(/,"");
addressLine = addressLine.replace(/\)$/,"");

return addressLine;
}

function cleanMeeting(meetingName) {
 var parenNum = "";
 var firstSide = meetingName.substr(0, meetingName.indexOf(' - ')).trim();
 var otherSide = meetingName.substr(meetingName.indexOf(' - ')+3,meetingName.length).trim();
 //check for weird number signs
 var findNumberParens = /(.*)(\(:?I+\))/i;
if (firstSide.match(findNumberParens)) {
   parenNum = firstSide.replace(findNumberParens, "$2").replace(":","");
  firstSide = firstSide.replace(findNumberParens, "$1").trim();
}
if (otherSide.match(findNumberParens)) {
   parenNum = otherSide.replace(findNumberParens, "$2").replace(":","");
  otherSide = otherSide.replace(findNumberParens, "$1").trim();
}
//clean both sides for testing
var firstTest = firstSide.replace(/[.,\(\):]/g,"").toUpperCase();
var otherTest = otherSide.replace(/[.,\(\):]/g,"").toUpperCase();
var cleanedName = firstSide;
 if (parenNum != "") {
   cleanedName += " " + parenNum;
 }
 if (!firstTest.match(otherTest)){
   cleanedName += " - " + otherSide;
}

 return cleanedName;
}

function cleanTimeArray(mytime) {
var myAMPM = mytime.substr(mytime.length-2,mytime.length);
 mytime = mytime.substr(0,mytime.length-2).trim();
 var timeArray = mytime.split(":");
 var thehour = Number(timeArray[0]);
 var theminute = Number(timeArray[1]);
 if (myAMPM == "PM" && thehour < 12){
  thehour += 12;
 } else if (myAMPM == "AM" && thehour == 12) {
    thehour += 0;
 }
 var newtimeArray = [];
 newtimeArray.push(thehour,theminute);
return newtimeArray;
}

function cleanDay(weekday) {
 var weekdays = [/^sun+/i,/^mon+/i,/^tues+/i,/^wed+/i,/^thurs+/,/^fri+/i,/^sat+/i];
 var weekNumber = 0;
 for (var q=0; q < weekdays.length;q++) {
  if (weekday.match(weekdays[q])) {
  weekNumber = q;
  break;
 }
 }
 return weekNumber;
 
}