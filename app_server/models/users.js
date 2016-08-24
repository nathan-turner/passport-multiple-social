var dbb = require('../../app_server/config/db');
var assert = require('assert');
var crypto = require('crypto');
var collection = 'users';
//todo
exports.findById = function(id, cb) {
  process.nextTick(function() {
   
  });
}

module.exports.setPassword = function(pass, username, db){ //change to use id
	//var collection = 'users';
	var numMatches = 0;
	var query = { 'email': username };
	var salt = crypto.randomBytes(16).toString('hex');
	var hash = crypto.pbkdf2Sync(pass, salt, 1000, 64).toString('hex');
	var options = {$set: { 'password': hash, 'salt': salt }};
	db.dbConnect( collection, 
		function(db, assert){
			db.collection(collection).update(query, options, function(err, object){
				if(err){
					console.warn(err.message);  // returns error if no matching object found
				}else{
					console.dir(object);
				}
			});
			//db.close();
		}
	);	
}

function createProfile(profile, type, db, cb){
	//var collection = 'users';
	var numMatches = 0;
	var insert = {};
	var options = {};
	var now = new Date();
	var jsonDate = now.toJSON();
	
	switch(type){
		case 'facebook':
			insert = { name: profile.displayName, email: profile.emails[0].value, facebook: { id: profile.id, displayName: profile.displayName, emails: profile.emails, photo: profile.photos[0] }, createDate: jsonDate };
			break;
		case 'twitter':
			insert = { name: profile.displayName, email: profile.email, twitter: { id: profile.id, displayName: profile.displayName, emails: profile.emails, photo: profile.profile_image_url }, createDate: jsonDate };
			break;
		case 'linkedin':
			insert = { name: profile.displayName, linkedin: { id: profile.id, displayName: profile.displayName, emails: profile.emails }, createDate: jsonDate };
			break;
		case 'google':
			insert = { name: profile.displayName, email: profile.emails[0].value, google: { id: profile.id, displayName: profile.displayName, photo: profile.photos[0].value }, createDate: jsonDate };
			break;		
	}
	//query = { 'facebook.id': profile.id };
	//options = {$set: { 'password': hash, 'salt': salt }};
	
	
	/*db.dbConnect( collection, 
		function(db, assert){*/
			db.collection(collection).insert(insert, function(err, doc){
				if(err){
					console.log(err);
				}
				else{
					console.log('inserted record');
				}
			});			
			//db.close();
			exports.mapProfile(profile, type, db, cb);
		//}
	//);
	console.log(profile);
	
	
	return cb(null, profile); //need to return passport's expected signature	
}

module.exports.mapProfile = function(profile, type, db, cb){ 
//process.nextTick(function() {
	//var collection = 'users';	
	var query = {};
	var numMatches = 0;
	var record;
	var email='';
	var user = {};	
	var exists = null;
	
	switch(type){
		case 'facebook':
			query = { 'facebook.id': profile.id };
			email = profile.emails[0].value;
			break;
		case 'twitter':
			query = { 'twitter.id': profile.id };
			email = profile.email;
			break;
		case 'linkedin':
			query = { 'linkedin.id': profile.id };
			break;
		case 'google':
			query = { 'google.id': profile.id };
			email = profile.emails[0].value;
			break;
		default: //nothing
			query = { 'id': profile.id };
			break;
	}
	console.log("Our query was:" + JSON.stringify(profile));
	//check if exists
	if(email!='' && email!=null){
		exports.findByUsername(email, db, function(err, exists){
			if(exists)
				console.log('the user exists'+email);
		});
	}
		cursor = db.collection(collection).find(query);
	//dbb.dbCursorConnect( db, collection, query, 1, //limit 1
		//function(cursor, db, assert){			
			cursor.forEach(
				function(doc) {
					numMatches +=1;					
					console.log( doc );
					record = doc;
					
				},
				function(err) {
					assert.equal(err, null);										
					console.log("Our query was:" + JSON.stringify(query));
					console.log("Matching documents: " + numMatches);
					if(record && numMatches>0){ //create existing user object
						//db.close();
						console.log("Matched record");
						if(record.email!='' && record.email!=null) //default to record's email if available
							email = record.email;						
							
						user = {
							_id: record._id,
							id: profile.id,
							email: email,
							name: profile.displayName,
							salt: record.salt
																			
						};
						user = profile;
						
						return cb(null, user); //need to return passport's expected signature
					}						
					else { //create new user
						//return createProfile(profile, type, cb);
						console.log("No Matched record");
						createProfile(profile, type, db, cb);
						//return false;
					}
				}
			);			
		//}
	//);
	return cb(null, profile);
//});	
}

module.exports.validPassword = function(pass, userhash, salt){ 
	var hash = crypto.pbkdf2Sync(pass, salt, 1000, 64).toString('hex');
	if (hash === userhash){
		console.log('password checks out');
		return true;
	}
	else{ return false; }	
}

module.exports.findByUsername = function(username, db, cb) {
  process.nextTick(function() {
	var match='';
	var record = null;
	var numMatches = 0;
	//var collection = 'users';
	var query = {}; 
	var hash, salt = null;	
	//blank username
	if(username==='')
		return cb(new Error('Username is required', null));
    
	//find username in db
	query = { 'email': username };
	dbb.dbCursorConnect( db, collection, query, 1,
		function(cursor, db, assert){			
			cursor.forEach(
				function(doc) {
					numMatches +=1;					
					console.log( doc );
					record = doc;
					hash = doc.password;
					salt = doc.salt;
					
				},
				function(err) {
					assert.equal(err, null);
					//db.close();
					//validPassword('abc123', hash, salt);
					console.log("Our query was:" + JSON.stringify(query));
					console.log("Matching documents: " + numMatches);
					if(record)
						return cb(null, record);
					else
						return cb(null, null);
				}
			);			
		}
	); //end cursor function
	
  });						
};

//add email to account
module.exports.registerProfile = function(post, db, cb){
	var valid = true;
	var message = [];
	var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
	console.log('register');
	
	if(post.fname=='' || post.fname==null)
		message.push('Firstname is required<br/>'), valid = false;
	if(post.lname=='' || post.lname==null)
		message.push('Lastname is required<br/>'), valid = false;
	if(post.email=='' || post.email==null)
		message.push('Email is required<br/>'), valid = false;
	if(post.password=='' || post.password==null)
		message.push('Password is required<br/>'), valid = false;
	if(post.password2=='' || post.password2==null)
		message.push('You must confirm your password<br/>'), valid = false;
	if(post.password !== post.password2)
		message.push('Your password and confirm password must match<br/>'), valid = false;
	if(!strongRegex.test(post.password))
		message.push('Your password does not meet the minimum strength requirements<br/>'), valid = false;
	
	console.log(valid);
	if(valid)
	{
		exports.findByUsername(post.email, db, function(err, record){
			if(err)
			{
				valid = false;
				message.push("There was an unexpected error");
			}
			if(record){
				valid = false;
				message.push("That email is already in use. Please login or use another email.");
			}
			if(valid){
				//create profile
			}
			return cb(valid, message);
		});			
		//TODO: need to send welcome email, etc.
	}
	else { return cb(valid, message); }
	
	//return cb(valid, message);	
};

//add email to account
module.exports.addEmail = function(email, id, db, cb){
	
};

//TODO
module.exports.forgotPassword = function(id, db, cb){
	
};

//TODO
module.exports.updateProfile = function(post, db, cb){
	
};

//TODO
module.exports.addLogin = function(post, db, cb){
	
};
