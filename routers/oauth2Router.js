var express = require('express');
var oauth2Controller = require('../controllers/oauth2server/oauth2Controller');
var router = express.Router();

// configure the site controller for oauth2 server
router.route('/')
	.get(oauth2Controller.index);

router.route('/login')
	.get(oauth2Controller.loginForm)
	.post(oauth2Controller.login);

router.route('/authorize')
	.get(oauth2Controller.authorization);

router.route('/authorize/decision')
	.post(oauth2Controller.decision);

router.route('/token')
	.post(oauth2Controller.token);

exports.router = router;
