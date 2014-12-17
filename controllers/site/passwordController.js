var models = require('../../models');
var accountVerification = require('../../utils/accountVerification');
var sendMailUtils = require('../../utils/send-mail');


exports.resetPasswdEmailForm = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/');
      } else {
        res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
              login : true, error : false, developer : developer});
      }
    });
  } else {
    res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
          login : false, error : false, email : ""});
  }
};

exports.resetPasswordEmailRequest = function (req, res) {
  var email = req.body.email;

  var loggedIn = (req.session && req.session.login);

  models.developers.findOneByEmail(email, function (err, developer) {
    if (err || !developer) {
      if (loggedIn) {
        models.developers.findOneByName(req.session.username, function (err, developer) {
          if (err | !developer) {
            res.redirect('/');
          } else {
            res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
                  login : loggedIn, error : true, errMsg : "Can't find that email, sorry!", developer : developer});
          }
        });

      } else {
        res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
              login : loggedIn, error : true, errMsg : "Can't find that email, sorry!", email : email});
      }
    } else {
      models.passwdresettokens.generate(developer, function (err, token) {
        if (err || !token) {
          res.redirect('/');
        } else {
          var recevier;
          if (developer.fullName) {
            recevier = developer.fullName + " <" + developer.email + ">";
          } else {
            recevier = developer.name + " <" + developer.email + ">";
          }

          sendMailUtils.sendResetPasswdRequestMail(recevier, token.id, function (err) {
            if (err) {
              console.log("err : ", err);
              //res.redirect('/');
            } else {
              console.log("success to send reset passwd mail to " + recevier);
            }
          });

          if (loggedIn) {
            models.developers.findOneByName(req.session.username, function (err, developer) {
              if (err || !developer) {
                res.redirect('/');
              } else {
                res.render('dev/passwd-reset-confirm', {title : "Password Sent! · Shinify", login : loggedIn, developer : developer});
              }
            });
          } else {
            res.render('dev/passwd-reset-confirm', {title : "Password Sent! · Shinify", login : loggedIn});
          }
        }
      });
    }
  });
};

exports.resetPasswordForm = function (req, res) {
  var loggedIn = (req.session && req.session.login);
  var tokenId = req.params.token_id;

  models.passwdresettokens.findOneById(tokenId, function (err, token) {
    if (err || !token) {
      var errMsg = "It looks like you clicked on an invalid/expired password reset link. Please try again.";
      if (loggedIn) {
        models.developers.findOneByName(req.session.username, function (err, developer) {
          if (err | !developer) {
            res.redirect('/');
          } else {
            res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
              login : loggedIn, error : true, errMsg : errMsg, developer : developer});
          }
        });
      } else {
        res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
              login : loggedIn, error : true, errMsg : errMsg, email : ""});
      }
    } else {
      if (loggedIn) {
        models.developers.findOneByName(req.session.username, function (err, developer) {
          if (err | !developer) {
            res.redirect('/');
          } else {
            res.render('dev/passwd-reset', {title : "Change your password · Shinify",
              login : loggedIn, error : false, developer : developer, token_id : token.id});
          }
        });
      } else {
        res.render('dev/passwd-reset', {title : "Change your password · Shinify",
              login : loggedIn, error : false, token_id : token.id});
      }
    }
  });
};

exports.resetPassword = function (req, res) {

  function makeErrorResponse(errMsg, tokenId) {
    var loggedIn = (req.session && req.session.login);
    if (loggedIn) {
      models.developers.findOneByName(req.session.username, function (err, developer) {
        if (err | !developer) {
          res.redirect('/');
        } else {
          res.render('dev/passwd-reset', {title : "Change your password · Shinify",
            login : loggedIn, error : true, errMsg : errMsg, developer : developer, token_id : tokenId});
        }
      });
    } else {
      res.render('dev/passwd-reset', {title : "Change your password · Shinify",
            login : loggedIn, error : true, errMsg : errMsg, token_id : tokenId});
    }
  };

  function makeNormolResponse() {
    var loggedIn = (req.session && req.session.login);
    if (loggedIn) {
      res.redirect('/home');
    } else {
      res.redirect('/login');
    }
  };

  var password = req.body.password;
  var password_confirmation = req.body.password_confirmation;

  var loggedIn = (req.session && req.session.login);
  var tokenId = req.params.token_id;

  models.passwdresettokens.findOneById(tokenId, function (err, token) {
    if (err || !token) {
      makeErrorResponse("It looks like you clicked on an invalid/expired password reset link. Please try again.", tokenId);
    } else {
      // check the user password
      accountVerification.checkPassword(password, password_confirmation,
          "Detail", function (err, result) {
        if (err) {
          makeErrorResponse("There are problems reseting your password!", token.id);
        } else if (result.error) {
          makeErrorResponse(result.msg, token.id);
        } else {
          models.developers.updatePasswordById(token._creator, password, function (err, developer) {
            if (err || !developer) {
              makeErrorResponse("There are problems reseting your password!", token.id);
            } else {
              sendMailUtils.sendResetPasswdConfirmMail(developer.name, developer.email, function (err) {
                if (err) {
                  console.log("err : ", err);
                } else {
                  console.log("success to send reset passwd confirmation mail to " + developer.email);
                }
              });

              makeNormolResponse();
            }
          });
        }
      });
    }
  });
};


exports.changePassword = function (req, res) {
  if (req.session && req.session.login) {

    function makeResponse(username, error, errMsg) {
      models.developers.findOneByName(username, function (err, developer) {
        if (err || !developer) {
          res.redirect('/home');
        } else {
          res.render('dev/admin', {title : "Account Settings · Shinify",
            successUpdate : !error, error : error, errMsg : errMsg, developer : developer});
        }
      });
    };

    var username = req.session.username;
    var user = req.body.user;

    var error = false;
    var errMsg;
    models.developers.findOneByNameAndPassword(username, user.old_password, function (err, developer) {
      if (err || !developer) {
        makeResponse(username, true, "Old password is invalid!");
      } else {
        // check the user password
        accountVerification.checkPassword(user.password, user.password_confirmation,
          "Detail", function (err, result) {
          if (err) {
            makeResponse(username, true, "There are problems changing your password!");
          } else if (result.error) {
            makeResponse(username, true, result.msg);
          } else {
            models.developers.updatePasswordByName(developer.name, user.password, function (err, developer) {
              if (err || !developer) {
                makeResponse(username, true, "There are problems changing your password!");
              } else {
                sendMailUtils.sendResetPasswdConfirmMail(developer.name, developer.email, function (err) {
                  if (err) {
                    console.log("err : ", err);
                  } else {
                    console.log("success to send password changed confirmation mail to " + developer.email);
                  }
                });
                makeResponse(username, false, null);
              }
            });
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
};
