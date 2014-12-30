var needle = require('../../../lib/needle');
var config = require('../../../config/');
var XmlDocument = require('xmldoc').XmlDocument;
var _ = require('underscore');

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

function getPreviousCursorOfTopics(cursor, count, total) {
	if (cursor >= total) {
		return -1;
	}

	if (cursor + count >= total) {
		return total;
	}
	return cursor + count;
}

function getNextCursorOfTopics(cursor, count) {
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
				var previousCursor = getPreviousCursorOfTopics(cursor == -1 ? currentCursor : cursor, 
												topics.length, totalCount);
				var nextCursor = getNextCursorOfTopics(cursor == -1 ? currentCursor : cursor, pageCount);
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

function getPreviousCursorOfTopicDetail(cursor, count, total) {
	if (cursor >= total) {
		return -1;
	}

	if (cursor + count >= total) {
		return total;
	}
	return cursor + count;
}

function getNextCursorOfTopicDetail(cursor, count) {
	if (cursor <=  1) {
		return -1;
	}
	if (cursor - count <= 0) {
		return 1;
	}
	return cursor - count;
}

function loadTopicDetail (id, loaded_by, board, cursor, count, callback) {
	var url = constructTopicDetailUrl(id, loaded_by, board, cursor, count);
	needle.get(url, {decode : true, parse : false}, function (error, response, body) {
		if (error) {
			console.log("err "+ error);
			return callback(error, null);
		} else {
			if (response.statusCode == 200) {
				var posts = [];
				var doc = new XmlDocument(response.body);
				var pageCount = doc.attr.page;
				var gid = doc.attr.gid;
				var postsRaw = doc.childrenNamed("po");
				var postCount = postsRaw.length;
				//var firstFid = ;
				//var lastFid = ;
				_.each(postsRaw, function(postRaw, index, list) {
					var post = {
						id : postRaw.attr.fid,
						//title : postRaw.valueWithPath("title"),
						poster : {
							name : postRaw.valueWithPath("owner"),
							nick : postRaw.valueWithPath("nick")
						},
						post_time : postRaw.valueWithPath("date"),

					};
					_.each(postRaw.childrenNamed("pa"), function(pa, idx, list1) {
						var m = pa.attr.m;
						if (m == "t") {
							post.body = pa.toString({compressed:true});
						} else if (m == "q") {
							//post.qoute = pa.toString({compressed:true});
						} else if (m == "s") {
							//post.poster.sign = pa.toString({compressed:true});
						}
					});
					posts.push(post);
				});
				/**
				<xsl:template name="tcon-navbar">
<a href="{/bbstcon/session/@m}doc?bid={@bid}">
<img src="../images/button/home.gif"/>
本讨论区
</a>
<xsl:if test="count(po) = @page">
<a href="tcon?new=1&bid={@bid}&g={@gid}&f={po[last()]/@fid}&a=n">
<img src="../images/button/down.gif"/>
下页
</a>
</xsl:if>
<xsl:if test="po[1]/@fid != @gid">
<a href="tcon?new=1&bid={@bid}&g={@gid}&f={po[1]/@fid}&a=p">
<img src="../images/button/up.gif"/>
上页
</a>
</xsl:if>
<xsl:if test="not(@tlast)">
<a href="tcon?new=1&bid={@bid}&f={@gid}&a=a">下一主题</a>
</xsl:if>
<xsl:if test="not(@tfirst)">
<a href="tcon?new=1&bid={@bid}&f={@gid}&a=b">上一主题</a>
</xsl:if>
</xsl:template>


				*/
				//var pos = document.descendantWithPath("bbstcon.po@bid");
				//console.log("pos"+pos.toString({compressed:true}));
				//console.log(document.toString({compressed:true}));
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
				return callback(null, posts);
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
