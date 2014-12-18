var express = require('express');
var router = express.Router();

var authController = require('../controllers/oauth2server/authStrategys');

router.route('/').get(
  function(req, res) {
    console.log("Cookies: ", req.cookies);
    res.json({ message: 'You are reaching the REST API for fudan bbs!' });
});

router.route('/v1/').get(authController.isBearerAuthenticated,
  function(req, res) {
    console.log("Cookies: ", req.cookies);
    res.json({ message: 'You are reaching the REST API for fudan bbs!' });
});

exports.router = router;
