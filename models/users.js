

exports.findByNameAndPassword = function (name, password, done) {
  console.log("user login : ", name);

  return done(null, {'name' : name, 'password' : password});
};

exports.findByName = function (name, done) {
  console.log("found user : ", name);
  return done(null , {name : name});
};
