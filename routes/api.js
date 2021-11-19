'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
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

const Issues = mongoose.model('Issues', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
		let project = req.params.project;
		let searchQuery = {project_name: project};
		
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
		if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
			console.log("Error");
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
			});
		}
		
	
		
    })
    
    .put(function (req, res){
		let project = req.params.project;
		
		if(!req.body._id){
			
			res.send({ error: 'missing _id' });
			
		}else if(!req.body.issue_text && !req.body.issue_title && !req.body.created_by && !req.	body.assigned_to && !req.body.status_text && !req.body.open){
			
			res.send({ error: 'no update field(s) sent', '_id': req.body._id });
		
		}else{
			Issues.find({_id: req.body._id, project_name: project}, function(err, issue){
				try{
					if(err){
						console.log("Error");
						res.send({ 'error': 'could not update', '_id': req.body._id });
					}
					if(issue.length === 0){
						console.log("Error");
						res.send({ 'error': 'could not update', '_id': req.body._id });
					}else{
						
						issue[0].assigned_to = req.body.assigned_to;
						issue[0].status_text = req.body.status_text;
						issue[0].open = req.body.open? false : true;
						issue[0].issue_title = req.body.issue_title;
						issue[0].issue_text = req.body.issue_text;
						issue[0].created_by = req.body.created_by;
						issue[0].updated_on = new Date();
						issue[0].save();
						
						res.send({result: 'successfully updated', '_id': req.body._id})
					}
				}catch(e){
					console.log("Error");
				}

			});
		}

	  
	})
    
    .delete(function (req, res){
		let project = req.params.project;
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
						console.log("Error");
						res.send(deleteError);
					}
					if(data.deletedCount === 0){
						res.send(deleteError);
					}else{
						res.send(deleteResult);
					}
				}catch(e){
					console.log("Error")
				}
			});
		}
		
    });
    
};
