var MongoClient = require('mongodb').MongoClient,
    //commandLineArgs = require('command-line-args'), 
    assert = require('assert');

var collection = "procareer"; //change
//var options = commandLineOptions();

//send callback
module.exports.dbCursorConnect = function(db, collection, query, limit, cb){
	var cursor;
	//MongoClient.connect('mongodb://localhost:27017/procareer', function(err, db) {
		//assert.equal(err, null);
		//console.log("Successfully connected to MongoDB.");
    
		//var query = queryDocument(options);
		//var projection = projectionDocument(options);	
		if(limit>0)
			cursor = db.collection(collection).find(query).limit(limit); //add query
		else
			cursor = db.collection(collection).find(query); 
		//cursor.project(projection);    
		
		//return db.collection('locations').find(query);
		cb(cursor, db, assert);   

//});
};

module.exports.dbConnect = function(collection, cb){

MongoClient.connect('mongodb://localhost:27017/procareer', function(err, db) {
    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");        
	cb(db, assert);    
});
};

function queryDocument(options) {

    console.log(options);
    
    var query = {};

    if ("overview" in options) {
        query.overview = {"$regex": options.overview, "$options": "i"};
    }
    
    return query;
    
}


function projectionDocument(options) {

    var projection = {
        "_id": 0,
        "name": 1,
        "founded_year": 1,
        "overview": 1
    };

    return projection;
}

/*
function commandLineOptions() {

    var cli = commandLineArgs([
        { name: "overview", alias: "o", type: String }
    ]);
    
    var options = cli.parse()
    if (Object.keys(options).length < 1) {
        console.log(cli.getUsage({
            title: "Usage",
            description: "You must supply at least one option. See below."
        }));
        process.exit();
    }

    return options;
    
}*/


