//The authorization codes.
//You will use these to get the access codes to get to the data in your endpoints as outlined
//in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
//(http://tools.ietf.org/html/rfc6750)


var mongodb = require('./mongooseinit').mongodb;
var Schema = mongodb.Schema;

var authorizationCodeSchema = new Schema({
  code : String,
  userName : String,
  clientId : String,
  redirectUri : String,
  scope : String
});

mongodb.model('AuthorizationCode', authorizationCodeSchema);

exports.AuthorizationCode = mongodb.model('AuthorizationCode');
