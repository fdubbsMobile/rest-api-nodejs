var mongodb = require('./mongooseinit').mongodb;
var Schema = mongodb.Schema;

var applicationSchema = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Developer' },
  name : String,
  url : String,
  callback : String,
  description : String,
  client : { id : String, secret : String},
  applyDate : { type: Date, default: Date.now }
});

mongodb.model('Application', applicationSchema);
exports.Application = mongodb.model('Application');
