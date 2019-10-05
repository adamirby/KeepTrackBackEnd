const mongoose = require('mongoose');

const userSchema =  mongoose.Schema({
	userName: String,
	password: String
}, { versionKey : false});

module.exports = mongoose.model('Users' , userSchema);
