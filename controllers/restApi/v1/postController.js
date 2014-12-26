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
				var posts = [];
				var topPosts = body.bbstop10.top;
				for (var key in topPosts) {
					posts.push(constructPost(topPosts[key]));
				}

				var result = {
					count : posts.length,
					post_list : posts
				};

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
	var sectionId = req.params.id;
	var board = req.query.board;
	if (sectionId && board) {
		var loaded_by = req.query.loaded_by ? 
					req.query.loaded_by : "BNAME";
		loadPostDetail(id, loaded_by, board, function (err, result) {
			if (err || !result) {
				res.json("Internal Service Error");
			} else {
				res.json(result);
			}
		});
	} else {
		var errMsg = "Ivalid Input!";
		if (!sectionId) {
			errMsg += "Section Id Missing;";
		}

		if (!board) {
			errMsg += "board Missing;";
		}
		res.json(errMsg);
	}
}

exports.getReplies = function (req, res) {
	res.json({ message: '/post/:id/reply' });
}