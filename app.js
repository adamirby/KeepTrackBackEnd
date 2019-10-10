const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();
const bodyParser = require('body-parser');

app.use(express.json());
app.use('/', require('./routes/user'));
app.use('/', require('./routes/item'));
app.use('/', require('./routes/tag'));
//app.use(bodyParser.json({ limit: '50mb'}));
//app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
//Connect to DB
mongoose.connect('mongodb://127.0.0.1:27017/KeepTrack', 
	{ useNewUrlParser: true,  useUnifiedTopology: true },
	
	() => {
	console.log('connected to MongoDB Database on localhost')
});

//Node.JS listen
app.listen(PORT, () => {
	console.log('Server running on port ' + PORT);
});



