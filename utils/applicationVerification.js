var config = require('../config');

exports.ApplicationVerifyResult = function  () {
  this.error = false;
  this.errMsg = "";
  this.nameErr = null;
  this.urlErr = null;
  this.callbackErr = null;
};

exports.checkAppName = function (name, done) {

  if (name === "") {
    console.log("Application name must not be blank!");
    return done(null, {error : true, msg : "Application name must not be blank!"});
  }

  return done(null, {error : false, msg : null});
};

exports.checkAppUrl = function (url, done) {

  if (url === "") {
    console.log("Homepage URL must not be blank!");
    return done(null, {error : true, msg : "Homepage URL must not be blank!"});
  }

  var pattern = /^htt(p|ps):\/\/([a-zA-Z0-9-_.\/])+/;
  if (!pattern.test(url)) {
    console.log("Homepage URL is invalid and must start with http:// or https:// !");
    return done(null, {error : true, msg : "Homepage URL is invalid and must start with http:// or https:// !"});
  }

  return done(null, {error : false, msg : null});
};

exports.checkAppCallback = function (callback, done) {

  if (callback === "") {
    console.log("Callback Url must not be blank!");
    return done(null, {error : true, msg : "Callback Url must not be blank!"});
  }

  var pattern = /^htt(p|ps):\/\/([a-zA-Z0-9-_.\/])+/;
  if (!pattern.test(callback)) {
    console.log("Callback Url is invalid and must start with http:// or https:// !");
    return done(null, {error : true, msg : "Callback Url is invalid and must start with http:// or https:// !"});
  }

  return done(null, {error : false, msg : null});
};
