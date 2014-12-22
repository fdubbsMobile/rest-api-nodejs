// load the packages as needed
//require('newrelic');

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var connectMongo =  require('connect-mongo');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var https = require('https');
var passport = require('passport');
var config = require('./config');
var models = require('./models');


//Pull in the mongo store if we're configured to use it
//else pull in MemoryStore for the session configuration
var sessionStorage;
if (config.session.type === 'MongoStore') {
    var MongoStore = connectMongo(session);
    console.log('Using MongoDB for the Session');
    sessionStorage = new MongoStore({
      url : config.db.url,
      db: config.db.dbName,
      collection: config.session.collection,
      clear_interval: 3600
    });
} else if(config.session.type === 'MemoryStore') {
    var MemoryStore = session.MemoryStore;
    console.log('Using MemoryStore for the Session');
    sessionStorage = new MemoryStore();
} else {
    //We have no idea here
    throw new Error("Within config/index.js the session.type is unknown: " + config.session.type )
}

console.log('Using MongoDB for the data store');
var mongoosedb = require('./mongodb/mongooseinit.js');
mongoosedb.connect(function(err) {
  if (err) {
    console.log('Fail to connect to mongodb!');
  } else {
    console.log('Succsee to connect to mongodb!');
  }
});

// Create our Express server
var server = express();

server.on('close', function(err) {
  mongoosedb.disconnect(function(err) {

  });
});




// Use environment defined port or 3000
server.set('port', (process.env.PORT || 3000));
server.set('view engine', 'ejs');

//static resources for stylesheets, images, javascript files
server.use(express.static(path.join(__dirname, 'public')));
server.use(cookieParser());


//Session Configuration
server.use(session({
    secret: config.session.secret(),
    store: sessionStorage,
    key: "authorization.sid",
    saveUninitialized: true,
    resave: true,
    cookie: {maxAge: config.session.maxAge }
}));

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});

// setup the logger
server.use(morgan('combined', {stream: accessLogStream}));


// Use the body-parser package in our application
server.use(bodyParser.urlencoded({
  extended: true
}));

server.use(passport.initialize());
server.use(passport.session());


// Create our Express router
var oauth2Router = require('./routers/oauth2Router').router;
var restApiRootRouter = require('./routers/restApiRootRouter').router;
var restApiV1Router = require('./routers/restApiV1Router').router;


// Register all our routes
server.use('/oauth2', oauth2Router);
server.use('/v1', restApiV1Router);
server.use('/', restApiRootRouter);


// check if run on heroku
if (process.env.NODE_ENV === 'production') {
    /* express */
    server.listen(server.get("port"), function () {
      console.log("Express server listening on port " + server.get('port'));
    });
} else {
  //TODO: Change these for your own certificates.  This was generated
  //through the commands:
  //openssl genrsa -out privatekey.pem 1024
  //openssl req -new -key privatekey.pem -out certrequest.csr
  //openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
  var options = {
      key: fs.readFileSync('certs/privatekey.pem'),
      cert: fs.readFileSync('certs/certificate.pem')
  };

  //This setting is so that our certificates will work although they are all self signed
  //TODO Remove this if you are NOT using self signed certs
  https.globalAgent.options.rejectUnauthorized = false;

  // Create our HTTPS server listening on port 3000.
  https.createServer(options, server).listen(server.get("port"));
}

console.log("OAuth 2.0 Authorization Server started on port " + server.get("port"));
