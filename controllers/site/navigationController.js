var models = require('../../models');


exports.index = function (req, res) {

  if (req.session && req.session.login) {
    res.redirect('/home');
  } else {
    res.render('dev/index', {title : "Shinify · Build your own client quickly."});
  }
};

exports.home = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;

    var title = "Shinify · " + username;
    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/');
      } else {
        models.applications.findByCreator(developer, function(err, applications) {
          if (err) {
            res.redirect('/home');
          } else {
            res.render('dev/home', {title : "Home · Shinify", developer : developer, applications : applications});
          }
        });
      }
    });

  } else {
    res.redirect('/');
  }
};

exports.admin = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;

    models.developers.findOneByName(username, function(err, developer){
      if (err || !developer) {
        res.redirect('/home');
      } else {
        res.render('dev/admin', {title : "Account Settings · Shinify",
          successUpdate : false, error : false, developer : developer});
      }
    });

  } else {
    res.redirect('/');
  }
};

exports.settings = function (req, res) {
  if (req.session && req.session.login) {
    res.redirect('/settings/profile');
  } else {
    res.redirect('/');
  }
};

exports.redirectControl = function (req, res) {
  res.redirect('/');
};
