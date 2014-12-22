

function loadSections (callback) {

}

function loadSectionDetail (id, callback) {

}

exports.getSections = function (req, res) {
	res.json({ message: '/sections' });
}

exports.getSectionDetail = function (req, res) {
	res.json({ message: '/section/:id' });
}