var fs = require('fs');
var crypto = require('crypto');
var Legicon = require('../utils/legicon-custom');


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


exports.create = function (user, done) {

  var encryptPasswd = genEncryptPassword(user.password);
  var avatarImg = genAvatar(user.name);

  var developer = new Developer({
  	name : user.name,
  	email : user.email,
  	password : encryptPasswd,
  	profile : {
  		avatarImg : avatarImg
  	}
  });

  developer.save(function (err) {
  	if (err) {
  		done(err);
  	} else {
  		done(null);
  	}
  });
};

function genAvatar(username) {
  var avatarImg = username +'_default.png';
  var userAvatar = Legicon(username);
  var stream = userAvatar.pngStream();
  var out = fs.createWriteStream(__dirname + '/../public/avatars/' + avatarImg);

  stream.on('data', function(chunk){
  	out.write(chunk);
  });

  stream.on('end', function(){
  	console.log('saved png');
  });

  return avatarImg;
}

function genEncryptPassword(password) {
	var pem = fs.readFileSync(__dirname + '/../certs/server.pem');
	var key = pem.toString('ascii');
	var hmac = crypto.createHmac('sha1', key);
	hmac.update(password);
	return hmac.digest('hex');
}
