var fs = require('fs');

//
// The configuration options of the server
//

exports.client = {
  clientIdLength : 20,
  clientSecretLength : 40
};

/**
 * Configuration of access tokens.
 *
 * accessTokenExpiresIn - The time in seconds before the access token expires
 * accessTokenExpirationDate - A simple function to calculate the absolute
 * time that th token is going to expire in.
 * authorizationCodeLength - The length of the authorization code
 * accessTokenLength - The length of the access token
 * refreshTokenLength - The length of the refresh token
 */
exports.token = {
    accessTokenExpiresIn: 3600,
    accessTokenExpirationDate: function() {
        return new Date(new Date().getTime() + (this.accessTokenExpiresIn * 1000));
    },
    authorizationCodeLength: 32,
    accessTokenLength: 128,
    refreshTokenLength: 128,
    passwdResetTokenLength: 64,
    passwdResetTokenExpiresIn: 3600 * 24,
    passwdResetTokenExpirationDate: function() {
        return new Date(new Date().getTime() + (this.passwdResetTokenExpiresIn * 1000));
    }
};

/**
 * Database configuration for access and refresh tokens.
 *
 * timeToCheckExpiredTokens - The time in seconds to check the database
 * for expired access tokens.  For example, if it's set to 3600, then that's
 * one hour to check for expired access tokens.
 * type - The type of database to use.  "db" for "in-memory", or
 * "mongodb" for the mongo database store.
 * dbName - The database name to use.
 */
exports.db = {
    url: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||
                    'mongodb://127.0.0.1:27017/ShinifyMongoose',
    timeToCheckExpiredTokens: 3600,
    type: "mongodb",
    dbName: "Shinify"
};

/**
 * Session configuration
 *
 * type - The type of session to use.  MemoryStore for "in-memory",
 * or MongoStore for the mongo database store
 * maxAge - The maximum age in milliseconds of the session.  Use null for
 * web browser session only.  Use something else large like 3600000 * 24 * 7 * 52
 * for a year.
 * secret - The session secret that you should change to what you want
 * dbName - The database name if you're using Mongo
 */
exports.session = {
    type: "MongoStore",
    maxAge: 3600000 * 24 * 7 * 52,
    secret: function () {
        var pem = fs.readFileSync(__dirname + '/../certs/server.pem');
        return pem.toString('ascii');
    },
    collection: "Sessions"
};

exports.env = {
  platform: "heroku"
};

exports.host = {
    address : "https://api-shinify.herokuapp.com"
};
