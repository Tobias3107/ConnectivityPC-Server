const { rejects } = require('assert');
const { timeStamp } = require('console');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var si = require('systeminformation');

/* Functions */

function getCoreTempData(callback) {
  fs.readFile('C:\\Program Files\\Core Temp\\Plugins\\localdata.json', 'utf8', (err, data) => {
    data = JSON.parse(data);
    // Clear up Array - From 255( or Something) to CPU Cores
    data.uiLoad = data.uiLoad.slice(0, data.uiCoreCnt); 
    data.uiTjMax = data.uiTjMax.slice(0, data.uiCoreCnt); // Not Tested. On my Setup there is no Data
    data.fTemp = data.fTemp.slice(0, data.uiCoreCnt); // Not Tested. On my Setup there is no Data
    callback(data);
    return;
  });
}

/* GET api listing. */
router.get('/', (req, res, next) => {
  res.send('Api Index');
});

router.get('/ALL', (req, res, next) => {
  si.getAllData().then(data => {
    res.json(data);
  })
});

router.get('/dynamic', (req, res, next) => {
  si.getDynamicData().then(data => {
    res.json(data);
  })
});

router.get('/net', (req, res, next) => {
  si.networkStats('Ethernet').then(data => {
    res.json(data);
  })
});

router.get('/mem', (req, res, next) => {
  si.mem().then(data => {
    res.json(data);
  })
});

router.get('/memLayout', (req, res, next) => {
  si.memLayout().then(data => {
    res.json(data);
  })
});

router.get('/coreTempData', (req, res, next) => {
  getCoreTempData((data) => {
    res.json(data);
  })
});

router.get('/temp', (req, res, next) => {
  getCoreTempData((data) => {
    res.json(data.fTemp);
  });
});

router.get('/coreUsage', (req, res, next) => {
  getCoreTempData((data) => {
    res.json(data.uiLoad);
  });
});

router.get('/tjMax', (req, res, next) => {
  getCoreTempData((data) => {
    res.json(data.uiTjMax);
  });
});

router.get('/coreCount', (req, res, next) => {
  getCoreTempData((data) => {
    res.json(data.uiCoreCnt);
  });
});

module.exports = router;
