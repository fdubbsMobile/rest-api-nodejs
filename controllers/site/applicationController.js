var models = require('../../models');
var applicationVerification = require('../../utils/applicationVerification');

exports.updateApplication = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;
    var app = req.body.application;
    app.client = {id : app.clientId, secret : app.clientSecret};

    function makeResponse(username, application, verifyResult){
      models.developers.findOneByName(username, function (err, developer) {
        if (err || !developer) {
          res.redirect('/');
        } else {
          res.render('dev/application-detail', {title : "OAuth2 Application · Shinify",
            developer : developer, application : application, verifyResult : verifyResult});
        }
      });
    };

    var verifyResult = new applicationVerification.ApplicationVerifyResult();

    // check the app name
    applicationVerification.checkAppName(app.name, function (err, result) {
      if (err) {
        verifyResult.error = true;
        verifyResult.errMsg = err;
      } else {
        verifyResult.error = verifyResult.error || result.error;
        verifyResult.nameErr = result.msg;
      }

      // check the app url
      applicationVerification.checkAppUrl(app.url, function (err, result) {
        if (err) {
          verifyResult.error = true;
          verifyResult.errMsg = err;
        } else {
          verifyResult.error = verifyResult.error || result.error;
          verifyResult.urlErr = result.msg;
        }

        // check the app callback
        applicationVerification.checkAppCallback(app.callback, function (err, result) {
          if (err) {
            verifyResult.error = true;
            verifyResult.errMsg = err;
          } else {
            verifyResult.error = verifyResult.error || result.error;
            verifyResult.callbackErr = result.msg;
          }

          if (verifyResult.error) {
            makeResponse(username, app, verifyResult);
          } else {
            models.applications.findByIdAndUpdate(req.params.app_id, app, function (err, application) {
              if (err || !application) {
                verifyResult.error = true;
                verifyResult.errMsg = "Cannot update application, please try again later!";
                makeResponse(username, app, verifyResult);
              } else {
                makeResponse(username, application, verifyResult);
              }
            });
          }
        });
      });
    });
  } else {
    res.redirect('/');
  }
};

exports.revokeTokens = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    var appId = req.params.app_id;

    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/');
      } else {
        models.applications.revokeTokens(appId, function(err) {
          if (err) {
            res.redirect('/home');
          } else {
            res.redirect('/settings/applications/'+appId);
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.resetSecret = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    var appId = req.params.app_id;

    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/');
      } else {
        models.applications.resetSecret(appId, function(err) {
          if (err) {
            res.redirect('/home');
          } else {
            res.redirect('/settings/applications/'+appId);
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.applications = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;

    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/');
      } else {
        models.applications.findByCreator(developer, function(err, applications) {
          if (err) {
            res.redirect('/home');
          } else {
            res.render('dev/applications', {title : "Authorized Applications · Shinify",
                developer : developer, applications : applications});
          }
        });

      }
    });
  } else {
    res.redirect('/');
  }
};

exports.applicationForm = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;
    var application = {name : "", url : "", callback : "", description : ""};

    var result = new applicationVerification.ApplicationVerifyResult();
    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/');
      } else {
        res.render('dev/application-new', {title : "New OAuth2 Application · Shinify",
          developer : developer, application : application, verifyResult : result});
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.removeApplication = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    var appId = req.params.app_id;

    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/');
      } else {
        models.applications.findByIdAndRemove(appId, function(err) {
          if (err) {
            res.redirect('/home');
          } else {
            res.redirect('/settings/applications');
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.applicationDetail = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    var appId = req.params.app_id;

    var result = new applicationVerification.ApplicationVerifyResult();

    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/');
      } else {
        models.applications.findById(appId, function(err, application) {
          if (err) {
            res.redirect('/home');
          } else {
            res.render('dev/application-detail', {title : "OAuth2 Application · Shinify",
              developer : developer, application : application, verifyResult : result});
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
};


exports.createApplication = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;
    var app = req.body.application;

    function makeResponse(username, application, verifyResult){
      models.developers.findOneByName(username, function (err, developer) {
        if (err || !developer) {
          res.redirect('/');
        } else {
          res.render('dev/application-new', {title : "New OAuth2 Application · Shinify", 
            developer : developer, application : application, verifyResult : verifyResult});
        }
      });
    };

    var verifyResult = new applicationVerification.ApplicationVerifyResult();

    // check the app name
    applicationVerification.checkAppName(app.name, function (err, result) {
      if (err) {
        verifyResult.error = true;
        verifyResult.errMsg = err;
      } else {
        verifyResult.error = verifyResult.error || result.error;
        verifyResult.nameErr = result.msg;
      }

      // check the app url
      applicationVerification.checkAppUrl(app.url, function (err, result) {
        if (err) {
          verifyResult.error = true;
          verifyResult.errMsg = err;
        } else {
          verifyResult.error = verifyResult.error || result.error;
          verifyResult.urlErr = result.msg;
        }

        // check the app callback
        applicationVerification.checkAppCallback(app.callback, function (err, result) {
          if (err) {
            verifyResult.error = true;
            verifyResult.errMsg = err;
          } else {
            verifyResult.error = verifyResult.error || result.error;
            verifyResult.callbackErr = result.msg;
          }

          if (verifyResult.error) {
            models.developers.findOneByName(username, function (err, developer) {
              if (err || !developer) {
                res.redirect('/');
              } else {
                res.render('dev/application-new', {title : "New OAuth2 Application · Shinify", 
                  developer : developer, application : app, verifyResult : verifyResult});
              }
            });
          } else {
            models.developers.findOneByName(username, function (err, developer) {
              if (err || !developer) {
                res.redirect('/');
              } else {
                models.applications.create(developer, app, function (err, application) {
                  if (err || !application) {
                    verifyResult.error = true;
                    verifyResult.errMsg = "Cannot save application, please try again later!";
                    res.render('dev/application-new', {title : "New OAuth2 Application · Shinify", 
                      developer : developer, application : app, verifyResult : verifyResult});
                  } else {
                    res.redirect('/settings/applications/'+application.id);
                  }
                });
              }
            }); 
          }
        });
      });
    });

  } else {
    res.redirect('/');
  }
};
