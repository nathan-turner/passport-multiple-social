var FacebookStrategy = require('passport-facebook').Strategy;
var LinkedInStrategy = require('passport-linkedin').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var users = require('../models/users');

module.exports = function (passport, db) {


passport.use(new LocalStrategy({
		usernameField: 'email'
	},
	function(username, password, done){
		//console.log('here1'+username+' '+password);
		users.findByUsername(username, db, function(err, user) {
			if (err) { console.log(err); /*return done(err);*/ }
			//if (!user) { return done(null, false, {message: 'Incorrect username.'}); }
			//if (user.password != password) { return done(null, false, {message: 'Incorrect password.'+user.password}); }
			if(user){
				if(users.validPassword(password, user.password, user.salt))
				{
					return done(null, user, {message: 'Login successful'});
				}	
				else{
					return done(null, false, {message: 'Incorrect password.'+user.password});
				}
			}
			else { return done(null, false, {message: 'Incorrect username.'}); }
			//return done(null, user);
		});
	})
);


// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_ID, //"263429214014637",
    clientSecret: process.env.CLIENT_SECRET, //"2454ee755f7043a3ae75ac5a71a91232",
    callbackURL: 'http://localhost:3000/login/facebook/return',
	profileFields: ['id', 'displayName', 'photos', 'email'] //added options
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.	
	//if(users.mapProfile(profile, 'facebook'))
	//profile = users.mapProfile(profile, 'facebook');	
	 users.mapProfile(profile, 'facebook', db, cb);
	 
		//console.log('successfully mapped');
	//return profile if success
    //return cb(null, profile);
  }));

// Use the LinkedInStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and LinkedIn profile), and
//   invoke a callback with a user object.
passport.use(new LinkedInStrategy({
    consumerKey: process.env.LINKEDIN_API_KEY,
    consumerSecret: process.env.LINKEDIN_SECRET_KEY,
    callbackURL: 'http://localhost:3000/login/linkedin/return'	
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's LinkedIn profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the LinkedIn account with a user record in your database,
      // and return that user instead.
	  users.mapProfile(profile, 'linkedin', db, done);
      //return done(null, profile);
    });
  }
));  


//twitter Strategy
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
	userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
    callbackURL: 'http://localhost:3000/login/twitter/return'
  },
  function(token, tokenSecret, profile, cb) {
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
	users.mapProfile(profile, 'twitter', db, cb);
    //return cb(null, profile);
}));

//Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,	
    callbackURL: "http://localhost:3000/login/google/return"	
  },
  function(accessToken, refreshToken, profile, cb) {
    //User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //return cb(err, user);
    //});
	users.mapProfile(profile, 'google', db, cb);
	//return cb(null, profile);
  }
));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
  /*db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });*/
});



} //end module exports