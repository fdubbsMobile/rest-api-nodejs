var express = require('express');
var router = express.Router();

var authController = require('../controllers/oauth2server/authStrategys');

router.route('/').get(
  function (req, res) {
		res.json({ message: 'You are reaching the REST API for fudan bbs!' });
	});

exports.router = router;
