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

function constructPostsUrl(loaded_by, board, 
				organized_by, cursor, count) {
	var url = config.bbs.host + "/bbs/";
	if (organized_by == "TOPIC") {
		url += "tdoc";
	} else {
		url += "doc";
	}

	if (loaded_by == "BNAME") {
		url += "?board=";
		url += board;
	} else {
		url += "?bid=";
		url += board;
	}

	return url;
}

function constructPosts(rawData, reqCount, pageCount) {
	var startIdx = pageCount - reqCount;
	var count = 0;
	for (var key in postsRaw) {
		if (count < startIdx) {
			continue;
		}
		count++;
		var postMetadata = constructPostMetaData(postsRaw[key]);
		if (!postMetadata) {
			continue;
		}
		posts.push(postMetadata);
	}
}

function constructPostMetaData(rawData) {
	var title = rawData._;
	var detail = rawData.$;

	if (detail.sticky 
		&& detail.sticky == "1") {
		return null;
	}

	var metadata = {
		id : detail.id,
		title : title,
		mark_sign : detail.m,
		post_time : detail.time,
		poster : {
			name : detail.owner
		}
	};
	return metadata;
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

function getPreviousCursor(total, current, count) {
	if (current > total) {
		return -1;
	}

	if (current + count > total) {
		return total;
	}
}

function loadPosts (loaded_by, board, organized_by, cursor, count, callback) {
	var url = constructPostsUrl(loaded_by, board, 
				organized_by, cursor, count);
	needle.get(url, options, function (error, response, body) {
		if (error) {
			console.log("err "+ error);
			callback(error, null);
		} else {
			if (response.statusCode == 200) {
				var totalCount = parseInt(body.bbsdoc.brd.$.total);
				var pageCount = parseInt(body.bbsdoc.brd.$.page);
				var currentCursor = parseInt(body.bbsdoc.brd.$.start);

				if (cursor > totalCount) {
					return callback("Invalid cursor : " + cursor, null);
				}				
				var previous_cursor = 
				var result = {
					count : posts.length,
					previous_cursor : cursor + posts.length,
					next_cursor : cursor - posts.length,
					post_list : posts
				};

				body.result = result;
				callback(null, body);
			} else {
				console.log("response status "+ response.statusCode);
				console.log("response body "+ response.body);
				callback(null, null);
			}
		}
	});
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
	//res.json({ message: '/posts/' });
	var board = req.query.board;
	if (board) {
		var loaded_by = req.query.loaded_by ? 
					req.query.loaded_by : "BID";
		var organized_by = req.query.organized_by ? 
					req.query.organized_by : "TOPIC";
		var cursor = req.query.cursor ?
					parseInt(req.query.cursor) : -1;
		var count = req.query.count ?
					parseInt(req.query.count) : 20;
		loadPosts(loaded_by, board, organized_by, cursor, count, function (err, result) {
			if (err || !result) {
				res.json("Internal Service Error");
			} else {
				res.json(result);
			}
		});
	} else {
		var errMsg = "Ivalid Input!";
		if (!board) {
			errMsg += "board Missing;";
		}
		res.json(errMsg);
	}
}

exports.getPostDetail = function (req, res) {
	var id = req.params.id;
	var board = req.query.board;
	if (id && board) {
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
		if (!id) {
			errMsg += "Post Id Missing;";
		}

		if (!board) {
			errMsg += "board Missing;";
		}
		res.json(errMsg);
	}
}

exports.getReplies = function (req, res) {
	//res.json({ message: '/post/:id/reply' });
	var id = req.params.id;
	var board = req.query.board;
	if (id && board) {
		var loaded_by = req.query.loaded_by ? 
					req.query.loaded_by : "BID";
		var cursor = req.query.cursor ?
					req.query.cursor : -1;
		var count = req.query.count ?
					req.query.count : 20;
		loadReplies(id, loaded_by, board, cursor, count, function (err, result) {
			if (err || !result) {
				res.json("Internal Service Error");
			} else {
				res.json(result);
			}
		});
	} else {
		var errMsg = "Ivalid Input!";
		if (!id) {
			errMsg += "Post Id Missing;";
		}

		if (!board) {
			errMsg += "board Missing;";
		}
		res.json(errMsg);
	}
}