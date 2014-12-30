var needle = require('../../../lib/needle');
var config = require('../../../config/');

var debugging   = !!process.env.DEBUG,
    debug       = debugging ? console.log : function() { /* noop */ };

var options = {
  decode : false,
  parse : true
}

function constructTopic(rawData) {
	var title = rawData._;
	var detail = rawData.$;

	var topic = {
		id : detail.gid,
		title : title,
		board : detail.board,
		post_count : detail.count,
		poster : {
			name : detail.owner
		}
	};

	return topic;
}

function loadHotTopics (callback) {
	var url = config.bbs.host + "/bbs/top10";
	needle.get(url, options, function (error, response, body) {
		if (error) {
			console.log("err "+ error);
			callback(error, null);
		} else {
			if (response.statusCode == 200) {
				var topics = [];
				var topTopics = body.bbstop10.top;
				for (var key in topTopics) {
					topics.push(constructTopic(topTopics[key]));
				}

				var result = {
					count : topics.length,
					topic_list : topics
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

function constructTopicsUrl(loaded_by, board, cursor, count) {
	var url = config.bbs.host + "/bbs/tdoc";
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

function constructTopics(rawData, startIdx, count) {
	var idx = 0;
	var topics = [];
	for (var key in rawData) {
		if (idx < startIdx) {
			idx++;
			continue;
		}
		var topicMetadata = constructTopicMetaData(rawData[key]);
		if (!topicMetadata) {
			continue;
		}
		topics.push(topicMetadata);
		count--;
		if (count ==0) {
			break;
		}
	}

	return topics;
}

function constructTopicMetaData(rawData) {
	var title = rawData._;
	var detail = rawData.$;

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
	if (cursor >= total) {
		return -1;
	}

	if (cursor + count >= total) {
		return total;
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

function loadTopics (loaded_by, board, cursor, count, callback) {
	var url = constructTopicsUrl(loaded_by, board, cursor, count);
	needle.get(url, options, function (error, response, body) {
		if (error) {
			console.log("err "+ error);
			return callback(error, null);
		} else {
			if (response.statusCode == 200) {
				
				var totalCount = parseInt(body.bbsdoc.brd.$.total);
				var pageCount = parseInt(body.bbsdoc.brd.$.page);
				var currentCursor = parseInt(body.bbsdoc.brd.$.start);

				if (cursor > totalCount) {
					return callback("Invalid cursor : " + cursor, null);
				}

				var topics = constructTopics(body.bbsdoc.po, cursor - currentCursor, count);		
				var previousCursor = getPreviousCursor(cursor == -1 ? currentCursor : cursor, 
												topics.length, totalCount);
				var nextCursor = getNextCursor(cursor == -1 ? currentCursor : cursor, pageCount);
				var result = {
					count : topics.length,
					previous_cursor : previousCursor,
					next_cursor : nextCursor,
					topic_list : topics
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

function constructTopicDetailUrl(id, loaded_by, board, cursor, count) {
	var url = config.bbs.host + "/bbs/tcon?new=1&g="+id;
	if (loaded_by == "BNAME") {
		url += "&board=";
		url += board;
	} else {
		url += "&bid=";
		url += board;
	}
	if (cursor != -1) {
		url += "&f=";
		url += cursor;
	}
	return url;
}

function loadTopicDetail (id, loaded_by, board, cursor, count, callback) {
	var url = constructTopicDetailUrl(id, loaded_by, board, cursor, count);
	needle.get(url, {decode : true, parse : false}, function (error, response, body) {
		if (error) {
			console.log("err "+ error);
			return callback(error, null);
		} else {
			if (response.statusCode == 200) {
				/*
				var totalCount = parseInt(body.bbsdoc.brd.$.total);
				var pageCount = parseInt(body.bbsdoc.brd.$.page);
				var currentCursor = parseInt(body.bbsdoc.brd.$.start);

				if (cursor > totalCount) {
					return callback("Invalid cursor : " + cursor, null);
				}

				var topics = constructTopics(body.bbsdoc.po, cursor - currentCursor, count);		
				var previousCursor = getPreviousCursor(cursor == -1 ? currentCursor : cursor, 
												topics.length, totalCount);
				var nextCursor = getNextCursor(cursor == -1 ? currentCursor : cursor, pageCount);
				var result = {
					count : topics.length,
					previous_cursor : previousCursor,
					next_cursor : nextCursor,
					topic_list : topics
				};
				*/
				return callback(null, response.body);
			} else {
				console.log("response status "+ response.statusCode);
				console.log("response body "+ response.body);
				return callback(null, null);
			}
		}
	});
}

exports.getHotTopics = function (req, res) {
	loadHotTopics(function (err, result) {
		if (err || !result) {
			res.json("Internal Service Error");
		} else {
			res.json(result);
		}
	});
}

exports.getTopics= function (req, res) {
	//res.json({ message: '/posts/' });
	var board = req.query.board;
	if (board) {
		var loaded_by = req.query.loaded_by ? 
					req.query.loaded_by : "BNAME";
		var cursor = req.query.cursor ?
					parseInt(req.query.cursor) : -1;
		var count = (req.query.count && parseInt(req.query.count) < 20 
			&& parseInt(req.query.count) > 0) ?
					parseInt(req.query.count) : 20;
		loadTopics(loaded_by, board, cursor, count, function (err, result) {
			if (err || !result) {
				res.json("Internal Service Error");
			} else {
				res.json(result);
			}
		});
	} else {
		var errMsg = "Invalid Input!";
		if (!board) {
			errMsg += "board Missing;";
		}
		res.json(errMsg);
	}
}

exports.getTopicDetail = function (req, res) {
	var id = req.params.id;
	var board = req.query.board;
	if (id && board) {
		var loaded_by = req.query.loaded_by ? 
					req.query.loaded_by : "BNAME";
		var cursor = req.query.cursor ?
					parseInt(req.query.cursor) : -1;
		var count = (req.query.count && parseInt(req.query.count) < 20 
			&& parseInt(req.query.count) > 0) ?
					parseInt(req.query.count) : 20;
		loadTopicDetail(id, loaded_by, board, cursor, count, function (err, result) {
			if (err || !result) {
				res.json("Internal Service Error");
			} else {
				res.json(result);
			}
		});
	} else {
		var errMsg = "Invalid Input!";
		if (!id) {
			errMsg += "Topic Id Missing;";
		}

		if (!board) {
			errMsg += "board Missing;";
		}
		res.json(errMsg);
	}
}
