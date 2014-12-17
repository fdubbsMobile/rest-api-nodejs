var config = require('../config');
var utils = require('../utils');

var AccessToken = require('../mongodb/accesstokens.js').AccessToken;


exports.findByToken = function (token, done) {
  AccessToken.findOne({'token' : token}, function (err, accessToken) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, accessToken);
    }
  });
};

exports.findByTokenAndRemove = function (token, done) {
  AccessToken.findOneAndRemove({'token' : token}, function (err, accessToken) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, accessToken);
    }
  });
};

exports.create = function (userName, clientId, scope, done) {
  var token = utils.uid(config.token.accessTokenLength);
  var expirationDate = config.token.accessTokenExpirationDate();

  var accessToken = new AccessToken({
    token : token,
    userName : userName,
    clientId : clientId,
    scope : scope,
    expirationDate : expirationDate
  });

  accessToken.save(function (err) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, accessToken);
    }
  });
};
