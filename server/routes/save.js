var express = require('express');
var router = express.Router();
var Design = require('../models/design.js');


router.post('/', function(req, res) {
    var id;
    console.log(req.body.id);
    console.log(req.body.json);
    if(req.body.id === undefined) {
        var design = new Design({title: 'test', owner: 'erob2620', design: req.body.json});
        design.save(function(err) {
            if(err) throw err;
            
            console.log('design saved successfully');
             
        });
        console.log(design._id);
        id = design._id;
    } else {
        Design.findById(req.body.id, function(err, design) {
            if(err) throw err;
            
            design.design = req.body.json;
            
            design.save(function(err) {
                if(err) throw err;
                
                console.log('design updated successfully');
            });
            id = design._id;
        });
        
    }
    res.send(id);
    
});

module.exports = router;