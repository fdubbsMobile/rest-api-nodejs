//The access tokens.
//You will use these to access your end point data through the means outlined
//in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
//(http://tools.ietf.org/html/rfc6750)
var mongodb = require('./mongooseinit').mongodb;
var Schema = mongodb.Schema;

var accessTokenSchema = new Schema({
  token : String,
  userName : String,
  clientId : String,
  expirationDate : Date,
  scope : String
});

mongodb.model('AccessToken', accessTokenSchema);

exports.AccessToken = mongodb.model('AccessToken');
