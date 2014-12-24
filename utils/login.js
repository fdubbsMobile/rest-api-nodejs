var needle = require('../lib/needle');

function doUserLogin (name, password, done) {
	debug("user " + name + " logining...");
	var url = config.bbs.host + "/bbs/login";
	var data = {
		id : name,
		pw : password
	};
	var options = {
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded' 
		}
	};
	data.id = name;
	data.pw = password;
	needle.post(url, data, function (err, response) {
		if (err) {
			return done(err, false);
		} else {
			console.log("response : " + JSON.stringify(response));
			return done(null, true);
		}
	});
};

exports.login = doUserLogin;