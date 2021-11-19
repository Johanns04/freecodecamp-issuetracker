const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);



suite('Functional Tests', function() {
  this.timeout(5000);
  let test_id = '';
  
  test('#1 Every field: POST:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.post('/api/issues/test')
		.send({
			issue_title: 'testing in the suit 1',
			issue_text: 'testing for everything',
			created_by: 'josam4',
			assigned_to: 'The one and only',
			status_text: 'open'
		})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.isObject(res.body);
			assert.exists(res.body._id);
			test_id = res.body._id;
			assert.equal(res.body.issue_title, 'testing in the suit 1');
			assert.equal(res.body.issue_text, 'testing for everything');
			assert.equal(res.body.created_by, 'josam4');
			assert.equal(res.body.assigned_to, 'The one and only');
			assert.equal(res.body.status_text, 'open');
			assert.equal(res.body.open, true);
			done();
		})
  });
  
  test('#2 Only required fields: POST:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.post('/api/issues/test-2')
		.send({
			issue_title: 'testing in the suit 1-2',
			issue_text: 'testing for everything-2',
			created_by: 'josam4-2'
		})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.isObject(res.body);
			assert.exists(res.body._id);
			assert.equal(res.body.issue_title, 'testing in the suit 1-2');
			assert.equal(res.body.issue_text, 'testing for everything-2');
			assert.equal(res.body.created_by, 'josam4-2');
			done();
		})
  });
  
  test('#3 Missing required fields: POST:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.post('/api/issues/test-3')
		.send({
			issue_title: 'testing in the suit 1-3',
			issue_text: 'testing for everything-3',
		})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.isObject(res.body);
			assert.deepEqual(res.body, {error: 'required field(s) missing'});
			done();
		})
  });
  
  test('#4 View issues: GET:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.get('/api/issues/apitest')
		.end((err, res)=>{
			assert.equal(res.status, 200);
			//assert.isObject(res.body);
			assert.isArray(res.body);
			done();
		})
  });
  
  test('#5 View issues with one filter: GET:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.get('/api/issues/apitest?open=true')
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.isArray(res.body);
			done();
		})
  });
  
  test('#6 View issues with multiple filters: GET:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.get('/api/issues/apitest?open=true&issue_title=jjjj')
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.isArray(res.body);
			done();
		})
  });
  
  test('#7 Update one field: PUT:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.put('/api/issues/test')
		.send({_id: test_id, issue_title: 'updated issue title'})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.deepEqual(res.body, {result: 'successfully updated', '_id': test_id});
			done();
		})
  });
  
  test('#8 Update multiple fields: PUT:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.put('/api/issues/test')
		.send({_id: test_id, issue_title: 'updated issue title 2', issue_text: 'Updating more than one field'})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.deepEqual(res.body, {result: 'successfully updated', '_id': test_id});
			done();
		})
  });
  
  test('#9 Update with missing _id: PUT:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.put('/api/issues/test')
		.send({issue_title: 'updated issue title 2', issue_text: 'Updating more than one field'})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.deepEqual(res.body, { error: 'missing _id' });
			done();
		})
  });

  test('#10 Update with no fields: PUT:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.put('/api/issues/test')
		.send({_id: test_id})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.deepEqual(res.body, { error: 'no update field(s) sent', '_id': test_id});
			done();
		})
  });
  
  test('#11 Update with invalid _id: PUT:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.put('/api/issues/test')
		.send({_id: '619687d57ad5d9a8d1d69ee0', issue_title: 'Updating with invalid _id'})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.deepEqual(res.body, { 'error': 'could not update', '_id': '619687d57ad5d9a8d1d69ee0' });
			done();
		})
  });
  
  test('#12 Delete an issue: DELETE:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.delete('/api/issues/test')
		.send({_id: test_id})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.deepEqual(res.body, { result: 'successfully deleted', _id: test_id });
			done();
		})
  });
  
  test('#13 Delete with invalid _id: DELETE:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.delete('/api/issues/test')
		.send({_id: '619687d57ad5d9a8d1d69ee0'})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.deepEqual(res.body, { error: 'could not delete', _id: '619687d57ad5d9a8d1d69ee0' });
			done();
		})
  });
  
  test('#14 Delete with missing _id: DELETE:/api/issues/{project}', (done)=>{
	  chai.request(server)
		.delete('/api/issues/apitest')
		.send({})
		.end((err, res)=>{
			assert.equal(res.status, 200);
			assert.deepEqual(res.body, { error: 'missing _id' });
			done();
		})
  });
  
});
