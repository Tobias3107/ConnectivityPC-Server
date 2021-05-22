const { rejects } = require('assert');
const { timeStamp } = require('console');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var si = require('systeminformation');
var os = require('os');
var osUtils = require('os-utils');
/* Functions */

function cpuAverage() {

  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();

  //Loop through CPU cores
  for(var i = 0, len = cpus.length; i < len; i++) {

    //Select CPU core
    var cpu = cpus[i];

    //Total up the time in the cores tick
    for(type in cpu.times) {
      totalTick += cpu.times[type];
   }     

    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }

  //Return the average Idle and Tick times
  return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

function getCoreTempData(callback) {
 /* fs.readFile('C:\\Program Files\\Core Temp\\Plugins\\localData.json', 'utf8', (err, data) => {
    if(err == null || typeof err == undefined) {
      data = JSON.parse(data);
      // Clear up Array - From 255( or Something) to CPU Cores
      data.uiLoad = data.uiLoad.slice(0, data.uiCoreCnt); 
      data.uiTjMax = data.uiTjMax.slice(0, data.uiCoreCnt); // Not Tested. On my Setup there is no Data
      data.fTemp = data.fTemp.slice(0, data.uiCoreCnt); // Not Tested. On my Setup there is no Data
      callback(data);
      return;
    } else {
      callback({errno: 500, message: "an Error occured on opening File. Make sure u have Core Temp and the Plugin installed."});
      console.log(err);
      return;
    }
  });*/
  var data = fs.readFileSync('C:\\Program Files\\Core Temp\\Plugins\\localData.json', 'utf8');
  if(data != null) {
    data = JSON.parse(data);
    // Clear up Array - From 255( or Something) to CPU Cores
    data.uiLoad = data.uiLoad.slice(0, data.uiCoreCnt); 
    data.uiTjMax = data.uiTjMax.slice(0, data.uiCoreCnt); // Not Tested. On my Setup there is no Data
    data.fTemp = data.fTemp.slice(0, data.uiCoreCnt); // Not Tested. On my Setup there is no Data
    callback(data);
    return;
  } else {
    callback({errno: 500, message: "an Error occured on opening File. Make sure u have Core Temp and the Plugin installed."});
    console.log(err);
    return;
  }   
}
/* GET api listing. */
router.get('/', (req, res, next) => {
  res.send('Api Index');
});

router.get('/coreTempData', (req, res, next) => {
  getCoreTempData((data) => {
    res.json(data);
  })
});

router.get('/ALL', (req, res, next) => {
  si.getAllData().then(data => {
    res.json(data);
  })
});

router.get('/cpuData', async (req, res, next) => {


//Grab first CPU Measure
var startMeasure = cpuAverage();
var percentageCPU;
//Set delay for second Measure
  await new Promise(resolve => setTimeout(resolve, 100));
  var endMeasure = cpuAverage(); 
  var idleDifference = endMeasure.idle - startMeasure.idle;
  var totalDifference = endMeasure.total - startMeasure.total;
  percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

  var coreData = { errno: 0 };
  getCoreTempData((data) => coreData = data);
  var siTemp = await si.cpuTemperature((data) => {
    return data;
  });


  // Andere Möglichkeit für Usage
  // this will be used later for Usage
  /*
  var siLoad = si.currentLoad(data => {
    return data;
  });*/

  console.log(typeof coreData.errno === undefined);
  if(typeof coreData.errno === undefined) {
    res.json({"temp": siTemp, "usage": percentageCPU});
  } else {
    res.json({"temp":{"main":0, "cores": coreData.fTemp}, "usage": coreData.uiLoad});
    
  }
});

router.get('/memData', (req, res, next) => {
  
});

module.exports = router;
