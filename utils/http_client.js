
var models = require('../models');
var iconv = require('iconv-lite');
var xml2jsParser = require('xml2js').Parser;
var XmlDocument = require('xmldoc').XmlDocument;
var Browser = require('zombie');
var Map = require('./map');
var clientMap = new Map();

var defaultUser = "usedfortest";
var defaultPasswd = "test";

function doUserLogin (callback) {
	console.log("user " + defaultUser + " logining...");

	var url = 'http://bbs.fudan.edu.cn/bbs/login';
	var data = {
		id : defaultUser,
		pw : defaultPasswd
	};

	HttpClient.getClient(defaultUser).doPost(url, data, {parse : false}, function (error, response, body) {
		if (error) {
			return done(error, false);
		}

		if (response.statusCode == 200) {
			models.users.insertOrUpdate(defaultUser, defaultPasswd, function (err) {
				if (err) {
					console.log("save error");
				} else {
					console.log("save success");
				}
			});
			return callback(null, true);
		} else {
			console.log("response : " + JSON.stringify(response));
			return callback(null, false);
		}
	});
};

var isLoginNeeded = function (body) {
	if (body.indexOf("a href='login'") != -1) {
		return true;
	}
	return false;
};

var parse_content_type = function(header) {
	if (!header || header == '') return {};
	var charset = 'utf-8', arr = header.split(';');
	try { 
		charset = arr[1].match(/charset=(.+)/)[1] 
	} catch (e) { /* not found */ }
	return { type: arr[0], charset: charset };
}

var decode = function (response, body, callback) {
	var headers = response.headers;
	var mime = parse_content_type(headers['content-type']);
	var result = body;
	try {
		console.log("decode charset : "+mime.charset);
		result = iconv.decode(new Buffer(body, mime.charset), mime.charset);
	} catch(e) {
		// do nothing
  	}
  	return callback(null, response, result);
};

var parse = function (type, response, body, callback) {
	var headers = response.headers;
	var mime = parse_content_type(headers['content-type']);
	if (mime.type != "text/html" 
		&& mime.type != "text/xml") {
		return callback(null, response);
	}

	if (type == "xml") {
		var result = new XmlDocument(body);
		return callback(null, response, result);
	} else if (type == "json") {
		console.log("parsing ... ");
		var parser = new xml2jsParser({
			explicitRoot : true,
			explicitArray: false
		});
		try {
			parser.parseString(body, function (error, result) {
				if (error || !result) {
					return callback(null, response, result);
				} else {
					return callback(null, response, result);
				}
			});
		} catch (err) {
			console.error('Error while processing: ', err);
			return callback(null, response, body);
		}
	} else {
		return callback(null, response, body);
	}
};

var requestCallback = function (options, callback) {
	var needParse = options.parse;
	if (needParse) {
		var type = options.type ? options.type : "json";
		return function (error, response) {
			if (error || !response) {
				callback(error, response, response.body);
			} else {
				decode(response, response.body, function (error, response, body) {
					parse(type, response, body, callback);
				});
			}
		};
	}
	return function (error, response) {
		decode(response, response.body, callback);
	};
}

function HttpClient() {
	console.log("creating client ... ");
	//var jar = request.jar(cookieStore);
	this.browser = Browser.create();
	this.browser.runScripts = false;
};

HttpClient.prototype.doPost = function(url, data, options, callback) {
	console.log("do post : " + url);
	var self = this;
	self.browser.resources.post(url, { params: data }, requestCallback(options, callback));
};

HttpClient.prototype.doGet = function(url, options, callback) {
	console.log("do get : " + url);
	var self = this;
	self.browser.resources.get(url, requestCallback(options, callback));
};

HttpClient.doGetAndLoginIfNeeded = function(url, options, callback) {
	var client = HttpClient.getClient(defaultUser);
	client.doGet(url, options, function (error, response, body) {
		if (error || response.statusCode != 200) {
			console.log(error);
			console.log("response status "+ response.statusCode);
			console.log("response body "+ response.body);
			return callback(error, response, body);
		} else {
			if (isLoginNeeded(response.body)) {
				console.log("need login : "+response.body);
				doUserLogin(function (err, success) {
					if (err || !success) {
						return callback("Login Needed!", response, body);
					} else {
						client.doGet(url, options, callback);
					}
				});
			} else {
				return callback(null, response, body);
			}
		}
	});
};

HttpClient.getClient = function(userName) {
	var client = clientMap.get(userName);
	if (!client) {
		console.log("No client found for " + userName);
		client = new HttpClient();
		clientMap.put(userName, client);
	}
	console.log("Client found for " + userName);
	return client;
};

module.exports = HttpClient;