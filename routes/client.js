var express = require('express');
var router = express.Router();

/* GET client page. */
router.get('/', function(req, res, next) {
  res.render('draw', { title: 'Express' });
});

module.exports = router;
