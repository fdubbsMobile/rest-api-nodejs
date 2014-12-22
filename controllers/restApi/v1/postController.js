var needle = require('needle');
var config = require('../../../config/');
var iconv = require('iconv').Iconv;
//var xml2js = require('xml2js-expat');
//var parser = new xml2js.Parser('UTF-8');

var options = {
  decode : false,
  parse : true
}

function loadTopPosts (callback) {

}

function loadPosts (loaded_by, board, organized_by, cursor, count, callback) {

}

function loadPostDetail (id, loaded_by, board, callback) {

}

function loadReplies (id, loaded_by, board, cursor, count, callback) {

}

exports.getTopPosts = function (req, res) {
	var url = config.bbs.host + "/bbs/top10";
	needle.get(url, options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(JSON.stringify(response.body));
			//res.header("Content-Type", "application/json; charset=gb18030");
			/*res.set({
				'Content-Type': 'application/json; charset=gb18030',
				'Content-Length' : Buffer.byteLength(response.body,'gb18030')
			});*/
	var buf = new Buffer(body,'binary');
    var content = new iconv('gb18030','UTF8').convert(buf).toString()
			res.json(content);
		}	
	});	
}

exports.getPosts = function (req, res) {
	res.json({ message: '/posts/' });
}

exports.getPostDetail = function (req, res) {
	res.json({ message: '/post/:id' });
}

exports.getReplies = function (req, res) {
	res.json({ message: '/post/:id/reply' });
}