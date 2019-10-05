const express = require('express');
const router = express.Router();
const User = require('../models/user');

//Searches for user in data base
router.get('/users', (req, res) => {
    let obj;

    if(!req.headers.hasOwnProperty('username'))
        obj = {};
    else
        obj = {userName: req.headers.username};

    User.find(obj)
    .then( doc =>{
        if(Object.keys(doc).length === 0){
            res.status(404).json(doc); //No content
        }else{
            res.status(200).json(doc); //OK
        }
    })
    .catch( err => {
        res.status(500).json({error: err}); //Internal Service Error
    });
});

//Checks to see if username and password are valid
router.get('/users/validate', (req, res) => {
    if(!req.headers.hasOwnProperty('username') || !req.headers.hasOwnProperty('password')){
        res.status(418).json({error: "Username or password not specified"});
    }else{
        let obj = {userName: req.headers.username, password: req.headers.password};

        User.find(obj)
        .then( doc =>{
            if(Object.keys(doc).length === 0)
                res.status(404).json({}); //Not Found
            else
                res.status(200).json(doc); //OK
        })
        .catch( err =>{
            res.status(500).json({error: err}); //Internal Service Error
        });
    }
});

//Creates a new user in the database
router.post('/users', (req, res) => {
	
    if(!req.headers.hasOwnProperty('username') || !req.headers.hasOwnProperty('password')){
        res.status(418).json({error: "Username or password not specified"}); //Teapot : Malformed request
    }else{
        User.find({userName: req.headers.username})
        .then ( doc => {
            if(Object.keys(doc).length === 0){
                let newUser = new User({userName: req.headers.username, password: req.headers.password});
                newUser.save()
                .then ( doc => {
                    res.status(200).json(doc); //OK
                })
                .catch (err => {
                    res.status(500).json({error: err}); //Internal Service Error
                });
            }else{
                res.status(409).json({error: "User Exists"}); //Conflict
            }
        })
        .catch (err =>{
            res.status(500).json({error: err}); //Internal Service Error
        });
    }
});

module.exports = router;
