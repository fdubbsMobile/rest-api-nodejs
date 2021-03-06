var config = require('../../../config/');
var HttpClient = require('../../../utils/http_client');


function constructBoardsUrl(type) {
	var url = config.bbs.host + "/bbs/";
	if (type == "FAVORITE") {
		url += "fav";
	} else {
		url += "all";
	}
	return url;
};

function constructAllBoards(body) {
	var boards = [];
	var allBoards = body.bbsall.brd;
	for (var key in allBoards) {
		var detail = allBoards[key].$;
		var cate = detail.cate;
		var idx1 = cate.indexOf("[");
		var idx2 = cate.indexOf("]");
		var board = {
			name : detail.title,
			description : detail.desc,
			category : cate.substring(idx1+1, idx2),
			is_directory : detail.dir == "0" ? false : true
		};

		if (detail.bm != "") {
			board.managers = detail.bm.split(" ");
		}
		boards.push(board);
	}
	return boards;
};

function loadAllBoards (url, callback) {
	HttpClient.doGetAndLoginIfNeeded(url, {parse : true, type : "json"}, 
		function (error, response, body) {
			if (error) {
				console.log(error);
				return callback("err", null);
			} else {
				console.log(JSON.stringify(response));
				var boards = constructAllBoards(body);
				var result = {
					count : boards.length,
					board_list : boards
				};
				return callback(null, result);
			}
		}
		);
};

function constructFavoriteBoards(body) {
	var boards = [];
	var allBoards = body.bbsfav.brd;
	for (var key in allBoards) {
		var description = allBoards[key]._;
		var detail = allBoards[key].$;
		var board = {
			id : detail.bid,
			name : detail.brd,
			description : description
		};
		boards.push(board);
	}
	return boards;
};

function loadFavoriteBoards(url, callback) {
	HttpClient.doGetAndLoginIfNeeded(url, {parse : true, type : "json"}, 
		function (error, response, body) {
			if (error) {
				console.log(error);
				return callback("err", null);
			} else {
				var boards = constructFavoriteBoards(body);
				var result = {
					count : boards.length,
					board_list : boards
				};
				return callback(null, result);
			}
		}
		);
};


function loadBoards (type, callback) {
	var url = constructBoardsUrl(type);
	if (type == "FAVORITE") {
		loadFavoriteBoards(url, callback);
	} else {
		loadAllBoards(url, callback);
	}
};

exports.getBoards = function (req, res) {
	var type = req.query.type ?  req.query.type : "ALL";
	loadBoards(type, function (err, result) {
		if (err || !result) {
			res.json("Internal Service Error");
		} else {
			res.json(result);
		}
	});
};
