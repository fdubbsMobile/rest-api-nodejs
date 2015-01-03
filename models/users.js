var config = require('../config');
var utils = require('../utils');
var loginManager = require('../utils/login');

var User = require('../mongodb/users.js').User;

var create = function (name, password, done) {
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
};

var findByNameAndPassword = function (name, password, done) {
  console.log("user login : ", name);
  User.findOne({name : name, password : password}, function (err, user) {
    if (err) {
      return done(err, null);
  	}else if (!user) {
  		console.log("cannot find user, try login");
  		loginManager.login(name, password, function (err, success, cookies) {
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
  		console.log("find user : " + JSON.stringify(user));
      return done(null, user);
    }
  });
};

var findByName = function (name, done) {
  
  User.findOne({name : name}, function (err, user) {
  	if (err || !user) {
  		return done("err", null);
  	} else {
  		console.log("found user : ", name);
  		return done(null , user);
  	}
  });
};

var insertOrUpdate = function (name, password, done) {
  findByName(name, function (err, user) {
    if (err) {
      return done("err", null);
    } else if (!user) {
      return create(name, password, done);
    } else {
      console.log("update user : "+user);
      user.password = password;
      user.save(function (err) {
        if (err) {
          return done(err, null);
        } else {
          return done(null, user);
        }
      });
    }
  });
};

exports.findByNameAndPassword = findByNameAndPassword;
exports.findByName = findByName;
exports.insertOrUpdate = insertOrUpdate;
