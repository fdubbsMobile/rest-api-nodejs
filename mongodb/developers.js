var mongodb = require('./mongooseinit').mongodb;
var Schema = mongodb.Schema;

var developerSchema = new Schema({
  name : String,
  email : String,
  password : String,
  joinDate : { type: Date, default: Date.now },
  profile : {
    avatarImg : String,
    fullName : String,
    location : String,
    company : String,
    url : String
  }
});

mongodb.model('Developer', developerSchema);

exports.Developer = mongodb.model('Developer');
