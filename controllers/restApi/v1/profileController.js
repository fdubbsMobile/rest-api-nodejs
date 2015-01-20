var config = require('../../../config/');
var HttpClient = require('../../../utils/http_client');

function needLogin (body) {
	if (body.indexOf("a href='login'") != -1) {
		return true;
	}
	return false;
};

function isLoginedUser(id) {
	return id == "usedfortest";
}

function constructBasicUrl (id) {
	var url = config.bbs.host + "/bbs/qry?u=" + id;
	return url;
}

function constructSelfProfile(rawData, user) {
	var info = rawData.bbsinfo.$;
	console.log("info:" +  JSON.stringify(info));
	
	var birthDay = {
		year : info.year,
		month : info.month,
		day : info.day
	};

	user.history.post_count = info.post;
	user.history.login_count = info.login;
	user.history.online_time = info.stay;
	user.history.register_date = info.since;
	user.history.last_login_ip = info.host;
	user.history.last_login_time = info.last;
	user.profile.gender = info.gender;
	user.profile.birth_date = info.birthDay;
	user.profile.nick = rawData.bbsinfo.nick;

	return user;
}

function loadSelfProfile(id, user, callback) {
	var url = config.bbs.host + "/bbs/info";
	HttpClient.doGetAndLoginIfNeeded(url, {parse : true, type : "json"}, 
		function (error, response, body) {
			if (error) {
				console.log(error);
				return callback("err", null);
			} else {
				var profile = constructSelfProfile(body, user);
				return callback(null, profile);
			}
		}
	);
}

function constructBasicProfile(body) {
	var states = body.bbsqry.st;
	var status = states && states[0] ? states[0].$ : null;
	console.log("status :" + JSON.stringify(status));
	var info = body.bbsqry.$;
	console.log("info:" +  JSON.stringify(info));

	var profile = {
		id : info.id,
		nick : body.bbsqry.nick,
		gender : info.gender,
		horoscope : info.horo,
		is_visible : status && status.vis == 1 ? true : false,
		is_web : status && status.web == 1 ? true : false,
		desc : status ? status.desc : "",
		signature : body.bbsqry.smd,
		ident : body.bbsqry.ident.indexOf("光华网友") != -1 ? "光华网友" : "天外来客"
	};

	var history = {
		idle_time : status ? status.idle : 0,
		post_count : info.post,
		login_count : info.login,
		last_login_time : info.lastlogin,
		last_login_ip : body.bbsqry.ip
	};

	var performance = {
		performance : info.perf,
		hp : info.hp,
		level : info.level,
		repeat : info.repeat,
		money : info.money,
		contrib : info.contrib,
		rank : info.rank
	};

	var user = {
		profile : profile,
		history : history,
		performance : performance
	};
	return user;
}

function loadProfile (id, callback) {
	var url = constructBasicUrl(id);
	HttpClient.doGetAndLoginIfNeeded(url, {parse : true, type : "json"}, 
		function (error, response, body) {
			if (error) {
				console.log(error);
				return callback("err", null);
			} else {
				var user = constructBasicProfile(body);
				if (isLoginedUser(id)) {
					loadSelfProfile(id, user, callback);
				} else {
					return callback(null, user);
				}
			}
		}
	);	
}

exports.getProfile = function (req, res) {
	//res.json({ message: '/profile' });
	var id = req.params.id;
	if (id) {
		var type = req.query.type ?  req.query.type : "BASIC";
		loadProfile(id, function (err, result) {
			if (err || !result) {
				res.json("Internal Service Error");
			} else {
				res.json(result);
			}
		});
	} else {
		var errMsg = "Invalid Input!";
		if (!id) {
			errMsg += "User Id Missing;";
		}
		res.json(errMsg);
	}
	
}