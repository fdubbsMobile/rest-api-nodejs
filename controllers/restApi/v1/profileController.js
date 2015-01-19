var config = require('../../../config/');
var HttpClient = require('../../../utils/http_client');
var loginManager = require('../../../utils/login');

function needLogin (body) {
	if (body.indexOf("a href='login'") != -1) {
		return true;
	}
	return false;
};

function isLoginedUser(id) {
	return id == "hidennis";
}

function constructBasicUrl (id) {
	var url = config.bbs.host + "/bbs/qry?u=" + id;
	return url;
}

function constructSelfProfile(rawData, user) {
	return user;
}

function loadSelfProfile(id, doLogin, user, callback) {
	var url = config.bbs.host + "/bbs/info";
	HttpClient.getClient("hidennis").doGet(url, 
		{parse : true, type : "json"}, function (error, response, body) {
			if (error) {
				console.log(error);
				return callback("err", null);
			} else {
				if (response.statusCode == 200) {
					if (needLogin(response.body)) {
						console.log("need login : "+response.body);
						if (!doLogin) {
							return callback("err", null);
						} else {
							loginManager.login("hidennis", "870914", function (err, success) {
								if (err || !success) {
									return callback("err", null);
								} else {
									loadSelfProfile(id, false, user, callback);
								}
							});
						}
					} else {
						var profile = constructSelfProfile(body, user);
						return callback(null, profile);
					}
				} else {
					console.log("response status "+ response.statusCode);
					console.log("response body "+ response.body);
					return callback(null, user);
				}
			}
	});
}

function constructBasicProfile(body) {
	var states = body.bbsqry.st;
	var status = states[0].$;
	console.log("status :" + JSON.stringify(status));
	var info = body.bbsqry.$;
	console.log("info:" +  JSON.stringify(info));

	var profile = {
		id : info.id,
		nick : body.bbsqry.nick,
		gender : info.gender,
		horoscope : info.horo,
		is_visible : status.vis == 1 ? true : false,
		is_web : status.web == 1 ? true : false,
		desc : status.desc,
		signature : body.bbsqry.smd,
		ident : body.bbsqry.ident
	};

	var history = {
		idle_time : status.idle,
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

function loadBasicProfile (id, doLogin, callback) {
	var url = constructBasicUrl(id);
	HttpClient.getClient("hidennis").doGet(url, 
		{parse : true, type : "json"}, function (error, response, body) {
			if (error) {
				console.log(error);
				return callback("err", null);
			} else {
				if (response.statusCode == 200) {
					if (needLogin(response.body)) {
						console.log("need login : "+response.body);
						if (!doLogin) {
							return callback("err", null);
						} else {
							loginManager.login("hidennis", "870914", function (err, success) {
								if (err || !success) {
									return callback("err", null);
								} else {
									loadBasicProfile(id, false, callback);
								}
							});
						}
					} else {
						var user = constructBasicProfile(body);
						if (isLoginedUser(id)) {
							loadSelfProfile(id, true, user, callback);
						} else {
							return callback(null, user);
						}
						
					}
				} else {
					console.log("response status "+ response.statusCode);
					console.log("response body "+ response.body);
					return callback(null, null);
				}
			}
		});	
}
/**
*  get profile of the specified user
*  @parameter id : user id whose profile being loaded
*  @parameter type : profile type, one of the "FULL","BASIC", "INTRODUCTION", "SIGNATURE"
*  @return profile of the specified user
**/
function loadProfile (id, type, callback) {
	if (type == "FULL") {
		loadFullProfile(id, callback);
	} else if (type == "INTRODUCTION") {
		loadIntroduction(id, callback);
	} else if (type == "SIGNATURE") {
		loadSignature(id, callback);
	} else {
		loadBasicProfile(id, true, callback);
	}
}

exports.getProfile = function (req, res) {
	//res.json({ message: '/profile' });
	var id = req.params.id;
	if (id) {
		var type = req.query.type ?  req.query.type : "BASIC";
		loadProfile(id, type, function (err, result) {
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