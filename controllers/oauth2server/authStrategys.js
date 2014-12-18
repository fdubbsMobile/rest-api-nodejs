var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var models = require('../../models');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
    function (username, password, done) {
        models.users.findByNameAndPassword(username, password, function (err, user) {
            if (err) {
                return done(err, null);
            }
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        });
    }
));

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy(
    function (id, secret, done) {
        models.applications.findByClientIdAndSecret(id, secret, function (err, application) {
            if (err) {
                return done(err, null);
            }
            if (!client) {
                return done(null, null);
            }

            return done(null, application.client);
        });
    }
));

/**
 * Client Password strategy
 *
 * The OAuth 2.0 client password authentication strategy authenticates clients
 * using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */
passport.use(new ClientPasswordStrategy(
    function (id, secret, done) {
        models.applications.findByClientIdAndSecret(id, secret, function (err, application) {
            if (err) {
                return done(err, null);
            }
            if (!application) {
                return done(null, null);
            }
            return done(null, application.client);
        });
    }
));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
    function (token, done) {
      console.log("using token : ", token);
        models.accessTokens.findByToken(token, function (err, accessToken) {
            if (err) {
                return done(err, null);
            }
            if (!accessToken) {
                return done(null, null);
            }

            console.log("found token : ", accessToken);
            if(new Date() > accessToken.expirationDate) {
                models.accessTokens.findByTokenAndRemove(token, function(err) {
                    return done(err);
                });
            } else {
                if (accessToken.userName != null) {
                    models.users.findByName(accessToken.userName, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        if (!user) {
                            return done(null, false);
                        }
                        // to keep this example simple, restricted scopes are not implemented,
                        // and this is just for illustrative purposes
                        var info = { scope: '*' };
                        return done(null, user, info);
                    });
                } else {
                  console.log("using  clientId : ", accessToken.clientId);
                    //The request came from a client only since userID is null
                    //therefore the client is passed back instead of a user
                    models.applications.findByClientId(accessToken.clientId, function (err, application) {
                        if (err) {
                            return done(err);
                        }
                        if (!application) {
                            return done(null, null);
                        }

                        console.log("found  application : ", application);
                        // to keep this example simple, restricted scopes are not implemented,
                        // and this is just for illustrative purposes
                        var info = { scope: '*' };
                        return done(null, application.client, info);
                    });
                }
            }
        });
    }
));

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

passport.serializeUser(function (user, done) {
    done(null, user.name);
});

passport.deserializeUser(function (name, done) {
    models.users.findByName(name, function (err, user) {
        done(err, user);
    });
});


exports.isAuthenticated = passport.authenticate(['local', 'bearer', 'basic', 'oauth2-client-password'], { session : false });
exports.isClientAuthenticated = passport.authenticate(['basic', 'oauth2-client-password'], { session : false });
exports.isUserAuthenticated = passport.authenticate(['local', 'bearer'], { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });
