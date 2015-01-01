var needle = require('../../../lib/needle');
var config = require('../../../config/');

var debugging   = !!process.env.DEBUG,
    debug       = debugging ? console.log : function() { /* noop */ };

var options = {
  decode : false,
  parse : true
}


function constructPostsUrl(loaded_by, board, cursor, count) {
	var url = config.bbs.host + "/bbs/doc";

	if (loaded_by == "BNAME") {
		url += "?board=";
		url += board;
	} else {
		url += "?bid=";
		url += board;
	}
	if (!cursor) {
		url += "&start=";
		url += cursor;
	}
	return url;
}

function constructPosts(rawData, startIdx, count) {
	var idx = 0;
	var posts = [];
	for (var key in rawData) {
		if (idx < startIdx) {
			idx++;
			continue;
		}
		var postMetadata = constructPostMetaData(rawData[key]);
		if (!postMetadata) {
			continue;
		}
		posts.push(postMetadata);
		count--;
		if (count ==0) {
			break;
		}
	}

	return posts;
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




function getPreviousCursor(cursor, count, total) {
	if (cursor == -1 || cursor + count > total) {
		return -1;
	}
	return cursor + count;
}

function getNextCursor(cursor, count) {
	if (cursor <=  1) {
		return -1;
	}
	if (cursor - count <= 0) {
		return 1;
	}
	return cursor - count;
}

function loadPosts (loaded_by, board, cursor, count, callback) {
	var url = constructPostsUrl(loaded_by, board, cursor, count);
	needle.get(url, options, function (error, response, body) {
		if (error) {
			console.log("err "+ error);
			return callback(error, null);
		} else {
			if (response.statusCode == 200) {
				
				var totalCount = parseInt(body.bbsdoc.brd.$.total);
				var pageCount = parseInt(body.bbsdoc.brd.$.page);
				var currentCursor = parseInt(body.bbsdoc.brd.$.start);

				if (cursor > totalCount || cursor == 0 || cursor < -1) {
					return callback("Invalid cursor : " + cursor, null);
				}

				var posts = constructPosts(body.bbsdoc.po, cursor == -1 ? 0 : cursor - currentCursor, count);		
				var previousCursor = getPreviousCursor(cursor == -1 ? currentCursor : cursor, 
												posts.length, totalCount);
				var nextCursor = getNextCursor(cursor == -1 ? currentCursor : cursor, pageCount);
				var result = {
					count : posts.length,
					previous_cursor : previousCursor,
					next_cursor : nextCursor,
					post_list : posts
				};

				return callback(null, result);
			} else {
				console.log("response status "+ response.statusCode);
				console.log("response body "+ response.body);
				return callback(null, null);
			}
		}
	});
}

function loadPostDetail (id, loaded_by, board, callback) {

}


exports.getPosts = function (req, res) {
	//res.json({ message: '/posts/' });
	var board = req.query.board;
	if (board) {
		var loaded_by = req.query.loaded_by ? 
					req.query.loaded_by : "BID";
		var cursor = req.query.cursor ?
					parseInt(req.query.cursor) : -1;
		var count = (req.query.count && parseInt(req.query.count) < 20 && parseInt(req.query.count) > 0) ?
					parseInt(req.query.count) : 20;
		loadPosts(loaded_by, board, cursor, count, function (err, result) {
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