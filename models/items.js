const mongoose = require('mongoose');

const itemSchema =  mongoose.Schema({
	userName: String,
	itemName: String,
	location: {type: String, default: ''},
	serial: {type: String, default: ''},
	price: {type: Number, default: 0.00},
	tags: {type: [String], default: []},
	img: {type: String, default: null},
	receipt: {type: String, default: null}
	
}, { versionKey : false});

module.exports = mongoose.model('Items' , itemSchema);
