//var needle = require('../lib/needle');
var request = require('request');
var User = require('../mongodb/users.js').User;
var models = require('../models');
var HttpClient = require('./http_client');

function doUserLogin (name, password, done) {
	console.log("user " + name + " logining...");

	var url = 'http://bbs.fudan.edu.cn/bbs/login';
	var data = {
		id : name,
		pw : password
	};

	HttpClient.getClient(name).doPost(url, data, {parse : false}, function (error, response, body) {
		if (error) {
			return done(error, false);
		}

		if (response.statusCode == 302) {
			models.users.insertOrUpdate(name, password, function (err) {
				if (err) {
					console.log("save error");
				} else {
					console.log("save success");
				}
			});
			return done(null, true);
		} else {
			console.log("response : " + JSON.stringify(response));
			return done(null, false);
		}
	});
};

exports.login = doUserLogin;