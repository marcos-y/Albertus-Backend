var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.send('the app is working...')
  console.log('the app is working...')
});

module.exports = router;
