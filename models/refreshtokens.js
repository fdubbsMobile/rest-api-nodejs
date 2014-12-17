var config = require('../config');
var utils = require('../utils');

var RefreshToken = require('../mongodb/refreshtokens.js').RefreshToken;

exports.create = function (userName, clientId, scope, done) {
  var token = utils.uid(config.token.refreshTokenLength);

  var refreshToken = new RefreshToken({
    token : token,
    userName : userName,
    clientId : clientId,
    scope : scope
  });

  refreshToken.save(function (err) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, refreshToken);
    }
  });
};

exports.findByToken = function (token, done) {
  RefreshToken.findOne({'token' : token}, function (err, refreshToken) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, refreshToken);
    }
  });
};
