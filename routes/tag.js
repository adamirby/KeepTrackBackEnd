const express = require('express');
const router = express.Router();
const Tag = require('../models/tags');

router.get('/tags', (req, res) => {
	if(!req.headers.hasOwnProperty('username'))
		res.status(418).json({error: "Username not specified"}); //Teapot : Malformed Request

		
	Tag.findOne({userName: req.headers.username})
	.then( doc => {
		res.status(200).json(doc.tags);
	})
	.catch( err =>{
		res.status(500).json({error: err});
	});	
});

module.exports = router;

