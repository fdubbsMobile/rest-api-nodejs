var models = require('../models');


exports.JoinVerifyResult = function () {
  this.error = false;
  this.errMsg = "There were problems creating your account.";
  this.nameErr = null;
  this.emailErr = null;
  this.passwordErr = null;
};

exports.checkUserName = function (username, done) {

  if (username === "") {
    console.log("Username must not be blank!");
    return done(null, {error : true, msg : "Username must not be blank!"});
  }

  var pattern = /^([a-zA-Z])([a-zA-Z0-9-])+/;
  if (!pattern.test(username)) {
    console.log("Username may only contain alphanumeric characters or dashes(-) and cannot begin with a dash!");
    return done(null, {error : true,
        msg : "Username may only contain alphanumeric characters or dashes(-) and cannot begin with a dash!"});
  }

  models.developers.findOneByName(username, function (err, developer) {
    if (err) {
      console.log(err);
      return done(err, {error : false, msg : null});
    } else if (developer) {
      console.log("Username is already taken!");
      return done(null, {error : true, msg : "Username is already taken!"});
    }

    return done(null, {error : false, msg : null});

  });
};

exports.checkEmail = function (email, done) {

  if (email === "") {
    console.log("Email must not be empty!");
    return done(null, {error : true, msg : "Email must not be empty!"});
  }

  var pattern = /^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
  if (!pattern.test(email)) {
    console.log("Email is invalid!");
    return done(null, {error : true, msg : "Email is invalid"});
  }

  models.developers.findOneByEmail(email, function (err, developer) {
    if (err) {
      console.log(err);
      return done(err, {error : false, msg : null});
    } else if (developer) {
      console.log("Email is already exist!");
      return done(null, {error : true, msg : "Email is already exist!"});
    }

    return done(null, {error : false, msg : null});
  });
};


exports.checkPassword = function (passwd, verifyPasswd, source, done) {
  if (passwd === "") {
    console.log("Password must not be empty!");
    return done(null, {error : true, msg : "Password must not be empty!"});
  }

  var lowercaseLetterPattern = /[a-z]/;
  var numberPattern = /[0-9]/;
  if (passwd.length < 8 ) {
    if (!lowercaseLetterPattern.test(passwd)) {
      console.log("Password is too short (minimum is 7 characters) and needs at least one lowercase letter!");
      return done(null, {error : true, msg : "Password is too short (minimum is 7 characters) and needs at least one lowercase letter!"});
    } else if (!numberPattern.test(passwd)) {
      console.log("Password is too short (minimum is 7 characters) and needs at least one number!");
      return done(null, {error : true, msg : "Password is too short (minimum is 7 characters) and needs at least one number!"});
    } else {
      console.log("Password is too short (minimum is 7 characters)!");
      return done(null, {error : true, msg : "Password is too short (minimum is 7 characters)!"});
    }
  } else  {
    if (!lowercaseLetterPattern.test(passwd)) {
      console.log("Password needs at least one lowercase letter!");
      return done(null, {error : true, msg : "Password needs at least one lowercase letter!"});
    } else if (!numberPattern.test(passwd)) {
      console.log("Password needs at least one number!");
      return done(null, {error : true, msg : "Password needs at least one number!"});
    }
  }

  // if the request is from Detail page, then check confirmation password
  // otherwise, bypass this check
  if (source === "Detail") {
    if (verifyPasswd != passwd) {
      console.log("Password doesn't match the confirmation!");
      return done(null, {error : true, msg : "Password doesn't match the confirmation!"});
    }
  }

  return done(null, {error : false, msg : null});

};
