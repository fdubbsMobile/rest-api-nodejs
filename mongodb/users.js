var mongodb = require('./mongooseinit').mongodb;
var Schema = mongodb.Schema;

var userSchema = new Schema({
  name : String,
  password : String
});

mongodb.model('User', userSchema);

exports.User = mongodb.model('User');
