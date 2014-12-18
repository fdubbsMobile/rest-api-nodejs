var fs = require('fs');
var crypto = require('crypto');


var Developer = require('../mongodb/developers.js').Developer;

exports.findById = function (id, done) {
  Developer.findById(id, function (err, developer) {
    if (err) {
      return done("There were problems checking user name.", null);
    } else if (developer) {
      return done(null, developer);
    }

    return done(null, null);
  });
};


exports.findOneByName = function (username, done) {
  Developer.findOne({name : username}, function (err, developer) {
  	if (err) {
  		return done("There were problems checking user name.", null);
  	} else if (developer) {
  		return done(null, developer);
  	}

  	return done(null, null);
  });
};


exports.findOneByEmail = function (email, done) {
  Developer.findOne({email : email}, function (err, developer) {
  	if (err) {
  		return done("There were problems checking user email.", null);
  	} else if (developer) {
  		return done(null, developer);
  	}

  	return done(null, null);
  });
};

exports.findOneByNameAndPassword = function (username, password, done) {

  var encryptPasswd = genEncryptPassword(password);
  Developer.findOne({name : username, password : encryptPasswd}, function (err, developer) {
  	if (err) {
  		return done("There were problems checking user email.", null);
  	} else if (developer) {
  		return done(null, developer);
  	}

  	return done(null, null);
  });
};



exports.updateProfile = function (username, profile, done) {

  var query = {name : username};

  Developer.findOne(query, function (err, developer) {
    if (err || !developer) {
      return done(err, null);
    } else {
      developer.profile.fullName = profile.name;
      developer.profile.location = profile.location;
      developer.profile.company = profile.company;
      developer.profile.url = profile.url;

      developer.save(function (err) {
        if (err) {
          return done(err, null);
        } else {
          return done(null, developer);
        }
      });
    }
  });
};

exports.updatePasswordById = function (id, password, done) {
  var encryptPasswd = genEncryptPassword(password);

  var update = {
    $set: { password : encryptPasswd }
  };

  Developer.findByIdAndUpdate(id, update, function (err, developer) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, developer);
    }
  });
};

exports.updatePasswordByName = function (username, password, done) {
  var encryptPasswd = genEncryptPassword(password);

  var query = {name : username};
  var update = {
    $set: { password : encryptPasswd }
  };

  Developer.findOneAndUpdate(query, update, function (err, developer) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, developer);
    }
  });
};



exports.remove = function (username, done) {

  Developer.findOneAndRemove({name : username}, function (err, developer) {
  	if (err) {
  		done(err, null);
  	} else {
  		done(null, developer);
  	}
  });
};




