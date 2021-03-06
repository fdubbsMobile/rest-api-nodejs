var config = require('../../../config/');
var HttpClient = require('../../../utils/http_client');

function constructSection(rawData) {
	var metaData = rawData.$;
	var desc = metaData.desc;

	var idx1 = desc.indexOf("[");
	var idx2 = desc.indexOf("]");

	var section = {
		id : metaData.id,
		name : desc.substring(0, idx1),
		category : desc.substring(idx1+1, idx2)
	};

	return section;
}

function constructBoard(rawData) {
	var detail = rawData.$;
	var cate = detail.cate;
	var idx1 = cate.indexOf("[");
	var idx2 = cate.indexOf("]");
	var board = {
		name : detail.title,
		description : detail.desc,
		category : cate.substring(idx1+1, idx2),
		total_posts : detail.count,
		is_directory : detail.dir == "0" ? false : true,
		has_unread : detail.read == "1" ? true : false,
	};

	if (detail.bm != "") {
		board.managers = detail.bm.split(" ");
	}

	return board;
}

function loadSections (callback) {
	var url = config.bbs.host + "/bbs/sec";
	HttpClient.doGetAndLoginIfNeeded(url, {parse : true, type : "json"}, 
		function (error, response, body) {
			if (error) {
				console.log(error);
				return callback("err", null);
			} else {
				var sections = [];
				var allSections = body.bbssec.sec;
				for (var key in allSections) {
					sections.push(constructSection(allSections[key]));
				}

				var result = {
					count : sections.length,
					section_list : sections
				};

				callback(null, result);
			}
		}
	);
}

function loadSectionDetail (id, callback) {
	var url = config.bbs.host + "/bbs/boa?s="+id;
	HttpClient.doGetAndLoginIfNeeded(url, {parse : true, type : "json"}, 
		function (error, response, body) {
			if (error) {
				console.log(error);
				return callback("err", null);
			} else {
				var boards = [];
				var allBoards = body.bbsboa.brd;
				for (var key in allBoards) {
					boards.push(constructBoard(allBoards[key]));
				}

				var result = {
					id : id,
					name : body.bbsboa.$.title,
					boards : boards
				};

				callback(null, result);
			}
		}
	);
}

exports.getSections = function (req, res) {
	loadSections(function (err, result) {
		if (err || !result) {
			res.json("Internal Service Error");
		} else {
			res.json(result);
		}
	});
}

exports.getSectionDetail = function (req, res) {
	//res.json({ message: '/section/:id' });
	var sectionId = req.params.id;
	if (sectionId) {
		loadSectionDetail(sectionId, function (err, result) {
			if (err) {
				res.json("Internal Service Error");
			} else if (!result) {
				res.json("Section Id Invalid");
			} else {
				res.json(result);
			}
		});
	} else {
		res.json("Section Id Missing");
	}
}