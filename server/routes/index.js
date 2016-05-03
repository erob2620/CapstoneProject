var express = require('express');
var router = express.Router();
var Design = require('../models/design.js');
var jwt = require('express-jwt');

var auth = jwt({
    secret: 'Temp_Secret',
    userProperty: 'payload'
});

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlDesigns = require('../controllers/designs');
router.get('/profile', auth, ctrlProfile.profileRead);
router.get('/designs', ctrlDesigns.designsRead);
router.get('/designs/shared', ctrlDesigns.sharedDesign);
router.get('/design', ctrlDesigns.readDesign);
//router.get('/oauthcallback', ctrlDesigns.getToken);
router.post('/designs/save', ctrlDesigns.designSave);
router.post('/designs/share', ctrlDesigns.shareDesign);
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

//router.get('/', function(req,res) {
//    var userDesigns;
//    console.log('from index route');
//    Design.find({ owner: 'erob2620'}, function(err, designs) {
//        if(err) throw err;
//        
//        res.render('index', {designs: designs, design: 1}); 
//
//    });
//    
//});
module.exports = router;