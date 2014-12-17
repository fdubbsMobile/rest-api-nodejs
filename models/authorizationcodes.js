var config = require('../config');
var utils = require('../utils');

var AuthorizationCode = require('../mongodb/authorizationcodes.js').AuthorizationCode;

exports.create = function (userName, clientId, redirectUri, scope, done) {

  var code = utils.uid(config.token.authorizationCodeLength);

  var authorizationCode = new AuthorizationCode({
    code : code,
    userName : userName,
    clientId : clientId,
    redirectUri : redirectUri,
    scope : scope
  });

  authorizationCode.save(function (err) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, authorizationCode);
    }
  });
};

exports.findOneByCode = function (code, done) {
  AuthorizationCode.findOne({'code' : code }, function (err, authorizationCode) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, authorizationCode);
    }
  });
};

exports.findByCodeAndRemove = function (code, done) {
  AuthorizationCode.findOneAndRemove({'code' : code }, function (err, authorizationCode) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, authorizationCode);
    }
  });
};
