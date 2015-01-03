var request = require('request');
var Map = require('./map');
var iconv = require('iconv-lite');
var xml2jsParser = require('xml2js').Parser;
var XmlDocument = require('xmldoc').XmlDocument;

var clientMap = new Map();


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
		return callback(null, response, body);
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
					return callback(null, response, body);
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
		return function (error, response, body) {
			decode(response, body, function (error, response, body) {
				parse(type, response, body, callback);
			});
		};
	}
	return function (error, response, body) {
		decode(response, body, callback);
	};
}

function HttpClient() {
	console.log("creating client ... ");
	this.jar = request.jar();
}

HttpClient.prototype.doPost = function(url, data, options, callback) {
	request.post({url : url, form : data, jar : this.jar}, 
		requestCallback(options, callback));
};

HttpClient.prototype.doGet = function(url, options, callback) {
	request.get({url : url, jar : this.jar},
		requestCallback(options, callback));
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