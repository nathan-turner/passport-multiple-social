//var express = require('express');
//var router = express.Router();
var users = require('../models/users');
var fun = require('../config/functions');

module.exports = function (app, passport, db) {
	
app.get('/login',
  function(req, res){
    res.render('login', { message: req.message });
  });
  
app.get('/register',
  function(req, res){
    res.render('register', { message: req.message });
});

app.post('/register',
  function(req, res){	
	var message="";
	users.registerProfile(req.body, db, function(valid, messages){
		messages.forEach( function(item) { 
			message += item;
		});
		res.render('register', { message: message + JSON.stringify(req.body), valid: valid, post: req.body });
	});
});

//Facebook routes
app.get('/login/facebook',
  passport.authenticate('facebook', { scope: ['email'] }));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { scope: ['email'], failureRedirect: '/login' }),
  //function(err, user, info) {
  function(req, res, err) {
	
	/*console.log("here you go"+req.user.id);  
	if(req.user.email!='' && req.user.email!=null)
		console.log('has email'+req.user.email);
	else
		console.log('no email'+JSON.stringify(req.user));*/
	
    res.redirect('/');
	
  });
//end Facebook routes
  
//linkedin routes
app.get('/login/linkedin',
  passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));

app.get('/login/linkedin/return', 
  passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'], failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });  
//end linkedin routes

//twitter routes
app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/login/twitter/return', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});
//end twitter routes

//Google routes
app.get('/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/login/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  //function(err, user, info) {
  function(req, res) {
	//token = generateJwt(req);
	//window.localStorage['app-token'] = token;
	
	//sendJSONresponse(res, 200, { "token": token });
		//console.log(JSON.stringify(res, null, 4));
	console.log("here you go"+req.user.id);  
    res.redirect('/');
  });
//end Google routes

//local route
app.post('/login', function(req, res, next) {
	if(!req.body.email || !req.body.password) {
		console.log('credentials required');
		//return res.redirect('/login?err=' + 'credentials required');
		return res.render('login', { message: "credentials required" });
		//return;
	}
  passport.authenticate('local', function(err, user, info) {
	var message = null;
	if(info)
		message = info.message;
	else 
		message='';
    if (err) { console.log(err); return res.redirect('/login?err=' + err + message); return next(err); }
    //if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { console.log(err); return res.redirect('/login?err=' + err + message); return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
 });
 
//module.exports = router;
  }