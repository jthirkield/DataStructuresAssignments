var fs = require('fs');
var theArray = [];
 
    var theInfo = new Object;
     theInfo.address = "Run's House, NY";
     theInfo.lat = "393939393";
     theArray.push(theInfo);
    var theInfo = new Object;
     theInfo.address = "Jon's House, NY";
     theInfo.lat = "493939393";
     theArray.push(theInfo);
     
 console.log(theArray);
 
 fs.writeFileSync('/home/ubuntu/workspace/data/aameetingsMapArray.txt', JSON.stringify(theArray, null, 1));
