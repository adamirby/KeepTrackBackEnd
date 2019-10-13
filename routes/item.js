const express = require('express');
const router = express.Router();
const csv = require('csv-express');
const Item = require('../models/items');
const Tag = require('../models/tags');
const User = require('../models/user');

function updateTags(userName){

	Tag.find({userName: userName})
	.then( doc => {
		if(Object.keys(doc).length === 0){ //If user does not have an entry in the tags collection, make one
        	let newUserTag = new Tag({
								userName: userName,
								tags: {},
								tagKeys: ''
							});	
			newUserTag.save();
		}

	 	Item.find({userName: userName})
    		.then(doc => {
        		let newTag = new Tag({
            		            userName: userName,
                		        tags: {},
								tagKeys: "test"		
                   	 	});

        		for(d in doc){ //Loop through all the users items, totaling the tags and adding new ones
            		for(t in doc[d].tags){
                		if(newTag.tags.has(doc[d].tags[t])){
                    		newTag.tags.set(doc[d].tags[t], newTag.tags.get(doc[d].tags[t]) + 1);
                		}else{
                    		newTag.tags.set(doc[d].tags[t], 1);
						}
            		}
        		}

        		Tag.findOneAndUpdate({userName: newTag.userName}, {$set:{tags: newTag.tags}}, {new: true})
        		.then(doc=>{
            		return; //Return back to calling route
        		})
        		.catch(err => {
            		res.status(500).json({error: err}); //Internal Service Error
        		});
    		})
    	.catch(err => {
        	res.status(500).json({errors: err}); //Internal Service Error
    	});
	})
	.catch( err => {
		res.status(500).json({error: err}); //Internam Service Error
	});
};

//Get all or specified item beloning to user
router.get('/items', (req, res) => {
	if(!req.headers.hasOwnProperty('username'))
		res.status(418).json({error: "Username not specified"}); //Teapot : Malformed Request
	
	let obj;

	if(!req.headers.hasOwnProperty('itemname')){
		obj = {userName: req.headers.username};
	}else{
		obj = {userName: req.headers.username, itemName: req.headers.itemname};
	}

	Item.find(obj)
	.collation({'locale' : 'en'})
	.sort({itemName : 1})
	.then( doc => { 
		if(Object.keys(doc).length === 0)
			res.status(404).json({error: "Item(s) not located"}); //Not found
		else{
			res.status(200).json(doc); //Item found and returned
		}
	})
	.catch( err => { 
		res.status(500).json({error: err}); //Internal Service Error
	});
	
});

//Get item by itemId
router.get('/items/id', (req, res) => {
	if(!req.headers.hasOwnProperty('id'))
		res.status(418).json({error: "ID not specified"}); //Teapot : Malformed Request

	Item.find({_id: req.headers.id})
	.then(doc => {
		res.status(200).json(doc); //Item found and returned
	})
	.catch (err => {
		res.status(500).json({error: err}); //Internal Service Error
	});
});

//Add new item
router.post('/items', (req, res) => {
	if(!req.headers.hasOwnProperty('username') || !req.headers.hasOwnProperty('itemname'))
		res.status(418).json({error: "Username or Itemname not specified"}); //Teapot : Malformed Request

	User.find({userName: req.headers.username})
	.then( doc => {
		if(Object.keys(doc).length === 0)
			res.status(404).json({error: "Username does not exist"});
	})
	.catch( err => {
		res.status(500).json({error: err}); //Internal Service Error
	});	

	let newItem = new Item({
		userName: req.headers.username,
		itemName: req.headers.itemname,
		location: req.headers.location,
		serial: req.headers.serial,
		price: req.headers.price,
		tags: req.headers.tags,
		//img: req.body.img,
		//receipt: req.body.receipt
	});

	newItem.save()
	.then( doc => {
		updateTags(newItem.userName);
		res.status(200).json(newItem); //Item seccessfulle saved
	})
	.catch( err => {
		res.status(500).json({error: err}); //Internal Service Error
	});
});

router.patch('/items/img', (req, res) => {
	if(!req.headers.hasOwnProperty('id'))
		res.status(418).json({error: 'ID not specified'});

	Item.findByIdAndUpdate(req.headers.id, req.body, {new: true}, (err, doc)=>{res.status(200).json(doc)});
	

});

//Remove an item
router.delete('/items', (req, res) => {
	if(!req.headers.hasOwnProperty('username') || !req.headers.hasOwnProperty('itemname'))
		res.status(418).json({error: "Username or Itemname not specified"}); //Teapot : Malformed Request
	
	let obj = {
		userName: req.headers.username,
		itemName: req.headers.itemname
	}
	
	Item.findOne(obj)
	.then( doc => {
        Item.findByIdAndDelete(doc)
        .then( doc => {
			updateTags(req.headers.username);
            res.status(200).json(doc); //Successfully deleted
        })
        .catch( err => {
            res.status(500).json({error: err}); //Internam Service Error
        });
	})
	.catch( err => {
		res.status(500).json({error: err}); //Internal Service Error
	});	
});

//Remove an iteb by itemId
router.delete('/items/id', (req, res) => {
	if(!req.headers.hasOwnProperty('id'))
		res.status(418).json({error: "ID not specified"}); //Teapot : Malformed Request  

	Item.findByIdAndDelete(req.headers.id)
	.then( doc => {
		updateTags(doc.userName);
		res.status(200).json(doc); //Seccuessfully Deleted
	})
	.catch( err => {
		res.status(500).json({error: err}); //Internal Serice Error
	});
});

// Export user items
router.get('/items/exporttocsv', function(req, res, next) {
    var filename   = "items.csv";
    var dataArray;

	
    if(!req.headers.hasOwnProperty('username'))
        res.status(418).json({error: "Username not specified"}); //Teapot : Malformed Request

    let obj = {userName: req.headers.username};

    Item.find(obj, ['_id', 'itemName', 'price', 'serial', 'location'],{sort:{itemName: 1}} ).lean().exec({}, function(err, items) {
        if (err) res.send(err);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/csv');
		//res.set('Content-Type', 'text/csv');
        res.setHeader("Content-Disposition", 'attachment; filename='+filename);
        res.csv(items, true);
    });
});

module.exports = router;

