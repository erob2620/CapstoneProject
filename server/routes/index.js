var express = require('express');
var router = express.Router();
var Design = require('../models/design.js');
router.get('/', function(req,res) {
    var userDesigns;
    console.log('from index route');
    Design.find({ owner: 'erob2620'}, function(err, designs) {
        if(err) throw err;
        
        res.render('index', {designs: designs, design: 1}); 

    });
    
});

module.exports = router;