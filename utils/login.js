var needle = require('../lib/needle');

var debugging   = !!process.env.DEBUG,
    debug       = debugging ? console.log : function() { /* noop */ };

function doUserLogin (name, password, done) {
	debug("user " + name + " logining...");
	return done(null, true);
};

exports.login = doUserLogin;