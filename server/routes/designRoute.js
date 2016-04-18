var express = require('express');
var router = express.Router();
var Design = require('../models/design.js');

exports.load = function(req,res) {
    console.log('individule design');
    Design.findById(req.params.id, function(err, design) {
        if(err) throw err;
        
        console.log(design);
        Design.find({owner: 'erob2620'}, function(err, designs) {
            if(err) throw err;
            
            
            res.render('index', {designs:designs, design: JSON.stringify(design)});
        });
    });
};
