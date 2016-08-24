require('dotenv').load();
var express = require('express');
var passport = require('passport');
var nunjucks = require('nunjucks');
var dbname = '';
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fun = require('./app_server/config/functions');
var dbURI = 'mongodb://localhost:27017/';
if(process.env.NODE_ENV==='production')
	dbURI = process.env.MONGOLAB_URI;
MongoClient.connect(dbURI+dbname, function(err, db) {
assert.equal(err, null);
console.log("Successfully connected to MongoDB.");
require('./app_server/config/passport')(passport, db);

// Create a new Express application.
var app = express();

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.use('/static', express.static(__dirname + '/static'));
app.set('view engine', 'html');
//app.set('view engine', 'ejs');
//app.engine('html', nunjucks);
nunjucks.configure('views', {
    //autoescape: true,
    express: app,
	tags: {
    blockStart: '<%',
    blockEnd: '%>',
    variableStart: '<$',
    variableEnd: '$>',
    commentStart: '<#',
    commentEnd: '#>'
 }
}
);





// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

/*app.get('/',
  function(req, res) {	
	if(req.user.email='')
		res.redirect('/noemail');
	else
		return;
  });*/
	//set up routes
	require('./app_server/routes/logins')(app, passport, db);


	
// Define routes.
app.get('/',
  function(req, res) {
	  var gparams = { user: req.user };
	  //enable this when we want to make sure they have an email
	  //signature: checkUserProfile(req, res, g_redir, b_redir, g_render, b_render, g_params, b_params)
	  fun.checkUserProfile(req, res, null, '/noemail', 'home', null, gparams, null);
	  //res.render('home', { user: req.user });
  });
 
app.get('/test', 
  function(req, res, next) {
	db.dbCursorConnect();
    res.render('test', { user: req.payload.user, jsonstring: JSON.stringify(req.user, null, 4) });
  });


  
app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user, jsonstring: JSON.stringify(req.user, null, 4) });
  });

  
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // req.user is available for use here
    return next(); }

  // denied. redirect to login
  res.redirect('/');
}

app.get('/protected', ensureAuthenticated, function(req, res) {
  res.send("access granted. secure stuff happens here");
});  

app.listen(3000);

});