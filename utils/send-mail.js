
var nodemailer = require('nodemailer');
var ejs = require('ejs');
var fs = require('fs');
var config = require('../config');

var transporter = nodemailer.createTransport();

exports.sendResetPasswdRequestMail = function (recevier, token, done) {

  var str = fs.readFileSync("./views/mail-templates/reset-passwd-request.ejs", 'utf8');
  var html = ejs.render(str, {hostAddress : config.host.address, resetToken : token});

  var mailOptions = {
    from: 'Shinify <noreply@shinify.com>',
    to: recevier,
    subject: '[Shinify] Please reset your password',
    html: html
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log(err);
      return done(err);
    } else {
      console.log('Email sent successfully');
      return done(null);
    }
  });
};

exports.sendResetPasswdConfirmMail = function (username, email, done) {
  var str = fs.readFileSync("./views/mail-templates/reset-passwd-confirm.ejs", 'utf8');
  var html = ejs.render(str, {hostAddress : config.host.address, username : username, email : email});

  var recevier = username + " <" + email + ">";

  var mailOptions = {
    from: 'Shinify <noreply@shinify.com>',
    to: recevier,
    subject: '[Shinify] Your password has changed',
    html: html
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log(err);
      return done(err);
    } else {
      console.log('Email sent successfully');
      return done(null);
    }
  });
};
