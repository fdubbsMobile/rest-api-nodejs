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

function loadSections (callback) {
	var url = config.bbs.host + "/bbs/sec";
	needle.get(url, options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var result = [];
			var allSections = body.bbssec.sec;
			for (var key in allSections) {
				result.push(constructSection(allSections[key]));
			}

			callback(null, result);
		} else {
			console.log("response "+ JSON.stringify(response));
			console.log("err "+ error);
			callback("internal error", null);
		}
	});
}

function loadSectionDetail (id, callback) {

}

exports.getSections = function (req, res) {
	//res.json({ message: '/sections' });
	loadSections(function (err, result) {
		if (err) {
			res.json(err);
		} else {
			res.json(result);
		}
	});
}

exports.getSectionDetail = function (req, res) {
	res.json({ message: '/section/:id' });
}