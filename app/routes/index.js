var express = require('express');
var router = express.Router();
var shopCtrl = require('../controller/shopCtrl');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test',shopCtrl.getMyShop);

module.exports = router;
