//The refresh tokens.
//You will use these to get access tokens to access your end point data through the means outlined
//in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
//(http://tools.ietf.org/html/rfc6750)


var mongodb = require('./mongooseinit').mongodb;
var Schema = mongodb.Schema;

var refreshTokenSchema = new Schema({
  token : String,
  userName : String,
  clientId : String,
  scope : String
});

mongodb.model('RefreshToken', refreshTokenSchema);

exports.RefreshToken = mongodb.model('RefreshToken');
