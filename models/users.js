var config = require('../config');
var utils = require('../utils');
var loginManager = require('../utils/login');

var User = require('../mongodb/users.js').User;

exports.findByNameAndPassword = function (name, password, done) {
  console.log("user login : ", name);
  User.findOne({name : name, password : password}, function (err, user) {
    if (err) {
      return done(err, null);
  	}else if (!user) {
  		loginManager.login(name, password, function (err, success) {
  			if (err || !success) {
  				return done(err, null);
  			} else {
  				var user = new User({
  					name : name,
  					password : password
  				});
  				user.save(function (err) {
    				if (err) {
      					return done(err, null);
    				} else {
      					return done(null, user);
    				}
  				});
  			}
  		});
  	} else {
      return done(null, user);
    }
  });
};

exports.findByName = function (name, done) {
  console.log("found user : ", name);
  return done(null , {name : name});
};
