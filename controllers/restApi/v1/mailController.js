

function loadMails (status, cursor, count, callback) {

}

function loadMailDetail (id, link, callback) {

}

exports.getMails = function (req, res) {
	res.json({ message: '/mails' });
}

exports.getMailDetail = function (req, res) {
	res.json({ message: '/mail/:id/:link' });
}