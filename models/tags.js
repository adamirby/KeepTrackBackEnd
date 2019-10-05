const mongoose = require('mongoose');

const tagSchema =  mongoose.Schema({
	userName: String,
	tags: {
		type: Map,
		of: Number
	}
}, { versionKey : false});

module.exports = mongoose.model('Tags' , tagSchema);
