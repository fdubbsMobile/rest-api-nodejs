var mongodb = require('./mongooseinit').mongodb;
var Schema = mongodb.Schema;

var passwdResetTokenSchema = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Developer' },
  expirationDate : Date
});


mongodb.model('PasswdResetToken', passwdResetTokenSchema);
exports.PasswdResetToken = mongodb.model('PasswdResetToken');
