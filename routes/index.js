var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('draw', { title: 'Express' });
});
router.get('/Chat_box', function(req, res, next) {
  res.render('Chat_box', { title: 'Express' });
});


module.exports = router;
