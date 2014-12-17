var fs = require('fs');
var utils = require('../utils');
var config = require('../config');

var PasswdResetToken = require('../mongodb/passwdresettokens.js').PasswdResetToken;

exports.generate = function (creator, done) {
  //var tokenId = utils.uid(config.token.passwdResetTokenLength);
  var expiredDate = config.token.passwdResetTokenExpirationDate();

  var token = new PasswdResetToken({
    _creator : creator.id,
    expirationDate : expiredDate
  });

  token.save(function (err) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, token);
    }
  });
};

exports.findOneById = function (tokenId, done) {
  PasswdResetToken.findById(tokenId, function (err, token) {
    if (err) {
      return done(err, null);
    } else {
      return done(null, token);
    }
  });
};

exports.removeExpired = function() {
  setInterval(function () {
    var now = new Date();
    PasswdResetToken.find({expirationDate : {$lte : now}}).remove(function (err, tokens) {
      if (err) {
        return done(err);
      } else {
        return done(null);
      }
    });
  }, config.db.timeToCheckExpiredTokens * 1000);
};

