var needle = require('../../../lib/needle');
var config = require('../../../config/');

var debugging   = !!process.env.DEBUG,
    debug       = debugging ? console.log : function() { /* noop */ };

var options = {
  decode : false,
  parse : true
}

function constructPost(rawData) {
	var title = rawData._;
	var detail = rawData.$;

	var post = {
		id : detail.gid,
		title : title,
		board : detail.board,
		reply_count : detail.count,
		poster : {
			name : detail.owner
		}
	};

	return post;
}

function loadTopPosts (callback) {
	var url = config.bbs.host + "/bbs/top10";
	needle.get(url, options, function (error, response, body) {
		if (error) {
			console.log("err "+ error);
			callback(error, null);
		} else {
			if (response.statusCode == 200) {
				var result = [];
				var topPosts = body.bbstop10.top;
				for (var key in topPosts) {
					result.push(constructPost(topPosts[key]));
				}

				callback(null, result);
			} else {
				console.log("response status "+ response.statusCode);
				console.log("response body "+ response.body);
				callback(null, null);
			}
		}
	});
}

function loadPosts (loaded_by, board, organized_by, cursor, count, callback) {

}

function loadPostDetail (id, loaded_by, board, callback) {

}

function loadReplies (id, loaded_by, board, cursor, count, callback) {

} 

exports.getTopPosts = function (req, res) {
	loadTopPosts(function (err, result) {
		if (err || !result) {
			res.json("Internal Service Error");
		} else {
			res.json(result);
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