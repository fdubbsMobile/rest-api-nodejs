var models = require('../../models');


/**
  Handle 'GET' request for '/login'
**/
exports.loginForm = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;

    var title = "Shinify · " + username;
    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/');
      } else {
        res.redirect('/home');
      }
    });

  } else {
    res.render('dev/login', {title : "Sign in · Shinify", error : false, username : ""});
  }

};


/**
  Handle 'POST' request for '/login'
**/
exports.login = function (req, res) {

  var username = req.body.user.username;
  var password = req.body.user.password;

  models.developers.findOneByNameAndPassword(username, password, function(err, developer) {
    if (err) {
      res.render('dev/login', {title : "Sign in · Shinify", 
          error : true, errMsg : "There were problems logging on.", username : username});
    } else if (!developer) {
      res.render('dev/login', {title : "Sign in · Shinify", 
          error : true, errMsg : "Incorrect username or password.", username : username});
    } else {
      req.session.username = username;
      req.session.login = true;
      res.redirect('/home');
    }
  });
};


/**
  Handle 'POST' request for '/logout'
**/
exports.logout = function (req, res) {
    req.session.destroy();
    res.redirect('/login');
};
