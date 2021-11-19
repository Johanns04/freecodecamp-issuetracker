'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
//const ObjectId = require('mongodb').ObjectID;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const issueSchema = new mongoose.Schema({
	project_name: {type: String},
	assigned_to: {type: String, default: ""},
	status_text: {type: String, default: ""},
	open: {type: Boolean, default: true},
	issue_title: {type: String}, 
	issue_text: {type: String},
	created_by: {type: String}, 
	created_on: {type: Date, default: Date.now},
	updated_on: {type: Date, default: Date.now}
});

/* const projectSchema = new mongoose.Schema({
	project_name: String,
	project_issues: [issueSchema] 
}); */

const Issues = mongoose.model('Issues', issueSchema);
//const Project = mongoose.model('Project', projectSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
		let project = req.params.project;
		let searchQuery = {project_name: project};
		
		//let searchObj =
		for(let x in req.query){
			searchQuery[x] =  req.query[x];
		}
		
		console.log(searchQuery, " <== Search Query");
		
		Issues.find(searchQuery)
			.exec('find', (err, data)=>{
				res.send(data);
			});
		
    })
    
    .post(function (req, res){
		let project = req.params.project;
		//console.log("I'm here at 0A");
		if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
			console.log("I'm in the 1A.");
			res.send({error: 'required field(s) missing'});
		}else{
			let newIssue = new Issues({
				project_name: project,
				issue_title: req.body.issue_title,
				issue_text: req.body.issue_text,
				created_by: req.body.created_by,
				assigned_to: req.body.assigned_to,
				status_text: req.body.status_text
			});
		
			newIssue.save((err, data)=>{
				if(err) console.log(err);
				res.send(data);
			//res.send(data);
			});
		}
		
	
		
    })
    
    .put(function (req, res){
		let project = req.params.project;
		/*let jsonSend = {
			result: 'successfully updated',
			_id: req.body._id
		};*/
		

		
		if(!req.body._id){
			
			res.send({ error: 'missing _id' });
			
		}else if(!req.body.issue_text && !req.body.issue_title && !req.body.created_by && !req.	body.assigned_to && !req.body.status_text && !req.body.open){
			
			res.send({ error: 'no update field(s) sent', '_id': req.body._id });
		
		}else{
			Issues.find({_id: req.body._id, project_name: project}, function(err, issue){
				try{
					if(err){
						console.log("I'm in here: A");
						res.send({ 'error': 'could not update', '_id': req.body._id });
					}
					if(issue.length === 0){
						console.log("I'm in here: B");
						res.send({ 'error': 'could not update', '_id': req.body._id });
					}else{
						console.log("I'm in here: C");
						//console.log(issue, " <== issue");
						
						issue[0].assigned_to = req.body.assigned_to;
						issue[0].status_text = req.body.status_text;
						issue[0].open = req.body.open? false : true;
						issue[0].issue_title = req.body.issue_title;
						issue[0].issue_text = req.body.issue_text;
						issue[0].created_by = req.body.created_by;
						issue[0].updated_on = new Date();
						issue[0].save();
						
						//send success
						//res.send(jsonSend);
						res.send({result: 'successfully updated', '_id': req.body._id})
					}
				}catch(e){
					console.log("I'm in here: E2");
					//res.send(e);
				}

			});
		}

	  
	})
    
    .delete(function (req, res){
		let project = req.params.project;
		//Issues.find({_id: req.body._id, project_name: project}).remove().exec();
		let deleteError = {
			error: 'could not delete',
			_id: req.body._id
		};
		let deleteResult ={
			result: 'successfully deleted',
			_id: req.body._id
		};
		
		if(!req.body._id){
			res.send({ error: 'missing _id' });
		}else{
			Issues.remove({_id: req.body._id, project_name: project}, (err, data)=>{
				try{
					if(err){
						console.log("I'm in here: D-A");
						res.send(deleteError);
					}
					if(data.deletedCount === 0){
						res.send(deleteError);
					}else{
						res.send(deleteResult);
					}
				}catch(e){
					console.log("I'm in Here: D-E")
				}
				//console.log(data.deletedCount, "<== Delete Data");	
			});
		}
		
    });
    
};
