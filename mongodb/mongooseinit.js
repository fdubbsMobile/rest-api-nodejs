var config = require('../config');
var mongoose = require('mongoose');


exports.connect = function(callback) {
	console.log('Trying to connect to mongodb : ', config.db.url);
    mongoose.connect(config.db.url, callback);
}

exports.disconnect = function(callback) {
    mongoose.disconnect(callback);
}

exports.mongodb = mongoose;
