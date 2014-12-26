var needle = require('../../../lib/needle');
var config = require('../../../config/');

var options = {
  decode : false,
  parse : true
}

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
	needle.get(url, options, function (error, response, body) {
		if (error) {
			console.log("err "+ error);
			callback(error, null);
		} else {
			if (response.statusCode == 200) {
				var sections = [];
				var allSections = body.bbssec.sec;
				for (var key in allSections) {
					sections.push(constructSection(allSections[key]));
				}

				var result = {
					section_list : sections,
					count : sections.length
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

function loadSectionDetail (id, callback) {
	var url = config.bbs.host + "/bbs/boa?s="+id;
	needle.get(url, options, function (error, response, body) {
		if (error) {
			console.log("err "+ error);
			callback(error, null);
		} else {
			if (response.statusCode == 200) {
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
			} else {
				console.log("response status "+ response.statusCode);
				console.log("response body "+ response.body);
				callback(null, null);
			}
		}
	});
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