var express = require('express');
var router = express.Router();

var authController = require('../controllers/oauth2server/authStrategys');

router.route('/').get(
  function (req, res) {
		res.render('test');
	});

exports.router = router;
