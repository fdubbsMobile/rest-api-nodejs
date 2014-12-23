/**
 * Module dependencies.
 */
var oauth2orize = require('oauth2orize')
var passport = require('passport');
var config = require('../../config');
var utils = require('../../utils');
var models = require('../../models');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

/**
 * Grant authorization codes
 *
 * The callback takes the `client` requesting authorization, the `redirectURI`
 * (which is used as a verifier in the subsequent exchange), the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a code,
 * which is bound to these values, and will be exchanged for an access token.
 */
server.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
    console.log("grant.code for redirectURI "+ redirectURI + " client " + client + " user " + JSON.stringify(user));
    models.authorizationCodes.create(user.name, client.id, redirectURI, client.scope, function (err, authorizationCode) {
        if (err) {
            return done(err, null);
        }
        console.log("code " + JSON.stringify(authorizationCode));
        return done(null, authorizationCode.code);
    });
}));

/**
 * Grant implicit authorization.
 *
 * The callback takes the `client` requesting authorization, the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a token,
 * which is bound to these values.
 */
server.grant(oauth2orize.grant.token(function (client, user, ares, done) {
    console.log("grant.token for client " + client + " user " + JSON.stringify(user));
    models.accessTokens.create(user.name, client.id, client.scope, function (err, accessToken) {
        if (err) {
            return done(err, null);
        }
        console.log("token " + JSON.stringify(accessToken));
        return done(null, accessToken.token, {expires_in: config.token.accessTokenExpiresIn});
    });
}));

/**
 * Exchange authorization codes for access tokens.
 *
 * The callback accepts the `client`, which is exchanging `code` and any
 * `redirectURI` from the authorization request for verification.  If these values
 * are validated, the application issues an access token on behalf of the user who
 * authorized the code.
 */
server.exchange(oauth2orize.exchange.code(function (client, code, redirectUri, done) {
    console.log("exchange.code for client " + client + " code " + code);
    models.authorizationCodes.findOneByCode(code, function (err, authCode) {
        if (err) {
            return done(err);
        }
        if (!authCode) {
            return done(null, false);
        }

        if (client.id !== authCode.clientId) {
            return done(null, false);
        }

        if (redirectUri !== authCode.redirectUri) {
            return done(null, false);
        }
        models.authorizationCodes.findByCodeAndRemove(code, function (err, result) {
            if (err) {
                return done(err, null);
            }

            models.accessTokens.create(authCode.userName, authCode.clientId, authCode.scope, function (err, accessToken) {
                if (err) {
                    return done(err);
                }

                //I mimic openid connect's offline scope to determine if we send
                //a refresh token or not
                if (authCode.scope && authCode.scope.indexOf("offline_access") === 0) {
                    models.refreshTokens.create(authCode.userName, authCode.clientId, authCode.scope, function (err, refreshToken) {
                        if (err) {
                            return done(err);
                        }

                        return done(null, accessToken.token, refreshToken.token, {expires_in: config.token.accessTokenExpiresIn});
                    });
                } else {
                    return done(null, accessToken.token, null, {expires_in: config.token.accessTokenExpiresIn});
                }
            });
        });
    });
}));

/**
 * Exchange user id and password for access tokens.
 *
 * The callback accepts the `client`, which is exchanging the user's name and password
 * from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the user who authorized the code.
 */
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    console.log("exchange.password for client " + client + " username " + username);
    //Validate the user
    models.users.findByNameAndPassword(username, password, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, null);
        }

        models.accessTokens.create(user.name, client.id, scope, function (err, accessToken) {
            if (err) {
                return done(err);
            }

            //I mimic openid connect's offline scope to determine if we send
            //a refresh token or not
            if (scope && scope.indexOf("offline_access") === 0) {
                models.refreshTokens.create(user.name, client.id, scope, function (err, refreshToken) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, accessToken.token, refreshToken.token, {expires_in: config.token.accessTokenExpiresIn});
                });
            } else {
                return done(null, accessToken.token, null, {expires_in: config.token.accessTokenExpiresIn});
            }
        });
    });
}));

/**
 * Exchange the client id and password/secret for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id and
 * password/secret from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the client who authorized the code.
 */
server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {
    var token = utils.uid(config.token.accessTokenLength);
    console.log("exchange.clientCredentials for client " + client + " token " + token);
    //Pass in a null for user id since there is no user when using this grant type
    models.accessTokens.create(null, client.id, scope, function (err, accessToken) {
        if (err) {
            return done(err);
        }
        return done(null, accessToken.token, null, {expires_in: config.token.accessTokenExpiresIn});
    });
}));

/**
 * Exchange the refresh token for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id from the token
 * request for verification.  If this value is validated, the application issues an access
 * token on behalf of the client who authorized the code
 */
server.exchange(oauth2orize.exchange.refreshToken(function(client, token, scope, done) {
    console.log("exchange.refreshToken for client " + client + " token " + token);
    models.refreshTokens.findByToken(token, function (err, refreshToken) {
        if (err) {
            return done(err);
        }
        if (!authCode) {
            return done(null, false);
        }
        if (client.id !== refreshToken.clientId) {
            return done(null, false);
        }

        models.accessTokens.create(refreshToken.userName, refreshToken.clientId, refreshToken.scope, function (err, accessToken) {
            if (err) {
                return done(err);
            }
            return done(null, accessToken.token, null, {expires_in: config.token.accessTokenExpiresIn});
        });
    });
}));


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

server.serializeClient(function (client, done) {
    console.log("serializeClient for client " + client);
    return done(null, client.id);
});

server.deserializeClient(function (id, done) {
    console.log("deserializeClient for id " + id);
    models.applications.findByClientId(id, function (err, application) {
        if (err) {
            return done(err, null);
        }
        console.log("application " + JSON.stringify(application));
        return done(null, application.client);
    });
});


exports.oauth2server = server;
