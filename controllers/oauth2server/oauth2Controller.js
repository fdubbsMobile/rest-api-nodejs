//TODO Document all of this

var passport = require('passport');
var login = require('connect-ensure-login');
var oauth2server = require('./oauth2server').oauth2server;
var models = require('../../models');

require('./authStrategys');

exports.index = function (req, res) {
  var code = req.query.code;

  if (code) {
    res.send({"code" : code});
  } else {
    res.render('oauth2/index');
  }

};

exports.loginForm = function (req, res) {
    res.render('oauth2/login');
};

exports.login = [
    passport.authenticate('local', {successReturnToOrRedirect: '/api', failureRedirect: 'login'})
];


/**
 * User authorization endpoint
 *
 * `authorization` middleware accepts a `validate` callback which is
 * responsible for validating the client making the authorization request.  In
 * doing so, is recommended that the `redirectURI` be checked against a
 * registered value, although security requirements may vary accross
 * implementations.  Once validated, the `done` callback must be invoked with
 * a `client` instance, as well as the `redirectURI` to which the user will be
 * redirected after an authorization decision is obtained.
 *
 * This middleware simply initializes a new authorization transaction.  It is
 * the application's responsibility to authenticate the user and render a dialog
 * to obtain their approval (displaying details about the client requesting
 * authorization).  We accomplish that here by routing through `ensureLoggedIn()`
 * first, and rendering the `dialog` view.
 */
exports.authorization = [
    login.ensureLoggedIn('/oauth2/login'),
    oauth2server.authorization(function (clientId, redirectURI, scope, done) {
        models.applications.findByClientId(clientId, function (err, application) {
            if (err) {
                return done(err);
            } else if (!application) {
                return done("Invalid client_id : " + clientId);
            }
            if(application) {
                application.scope = scope;
            }

            // WARNING: For security purposes, it is highly advisable to check that
            //          redirectURI provided by the client matches one registered with
            //          the server.  For simplicity, this example does not.  You have
            //          been warned.
            return done(null, application.client, redirectURI);
        });
    }),
    function (req, res, next) {
        //Render the decision dialog if the client isn't a trusted client
        //TODO Make a mechanism so that if this isn't a trusted client, the user can recorded that they have consented
        //but also make a mechanism so that if the user revokes access to any of the clients then they will have to
        //re-consent.
        models.applications.findByClientId(req.query.client_id, function(err, application) {
            if(!err && application && application.trustedClient && application.trustedClient === true) {
                //This is how we short call the decision like the dialog below does
                oauth2server.decision({loadTransaction: false}, function(req, callback) {
                    callback(null, { allow: true });
                })(req, res, next);
            } else {
                res.render('oauth2/dialog', { transactionID: req.oauth2.transactionID, 
                    user: req.user, application: application, scope : req.query.scope });
            }
        });
    }
];

/**
 * User decision endpoint
 *
 * `decision` middleware processes a user's decision to allow or deny access
 * requested by a client application.  Based on the grant type requested by the
 * client, the above grant middleware configured above will be invoked to send
 * a response.
 */
exports.decision = [
    login.ensureLoggedIn('/oauth2/login'),
    oauth2server.decision(function(req, done) {
        return done(null, { scope: req.body.scope })
    })
];

/**
 * Token endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    oauth2server.token(),
    oauth2server.errorHandler()
];
