
var config = require('../config');
var utils = require('../utils');

var Application = require('../mongodb/applications.js').Application;

exports.findByClientIdAndSecret = function (clientId, secret, done) {
  Application.findOne({'client.id': clientId, 'client.secret' : secret}, function (err, application) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, application);
    }
  });
};


exports.findByClientId = function (clientId, done) {
  Application.findOne({'client.id': clientId}, function (err, application) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, application);
    }
  });
};

exports.findByIdAndUpdate = function (id, app, done) {
  Application.findById(id, function (err, application) {
    if (err || !application) {
      return done(err, null);
    } else {
      application.name = app.name;
      application.url = app.url;
      application.callback = app.callback;
      application.description = app.description;
      application.save(function (err) {
        if (err) {
          return done(err, null);
        } else {
          return done(null, application);
        }
      });
    }
  });
};

exports.findByIdAndRemove = function (id, done) {
  Application.findByIdAndRemove(id, function (err, application) {
    if (err) {
      return done(err);
    } else {
      return done(null);
    }
  });
};

exports.findById = function (id, done) {
  Application.findById(id, function (err, application) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, application);
    }
  });
};

exports.findByCreator = function (creator, done) {
  Application.find({_creator : creator.id}, function (err, applications) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, applications);
    }
  });
};


exports.create = function (creator, app, done) {
  var clientId = utils.uid(config.client.clientIdLength);
  var clientSecret = utils.uid(config.client.clientSecretLength);

  var application = new Application({
    _creator : creator.id,
    name : app.name,
    url : app.url,
    callback : app.callback,
    description : app.description,
    client : {
      id : clientId,
      secret : clientSecret
    }
  });

  application.save(function (err) {
    if (err) {
      done(err, null);
    } else {
      done(null, application);
    }
  });
};


// TODO : revoke all user token for the specified application
exports.revokeTokens = function (appId, done) {
  return done(null);
};

exports.resetSecret = function (appId, done) {

  var clientSecret = utils.uid(config.client.clientSecretLength);

  Application.findById(appId, function (err, application) {
    if (err || !application) {
      return done(err, null);
    } else {
      application.client.secret = clientSecret;
      application.save(function (err) {
        if (err) {
          return done(err, null);
        } else {
          return done(null, application);
        }
      });
    }
  });
};
