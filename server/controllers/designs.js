var mongoose = require('mongoose');
var Design = mongoose.model('Design');

module.exports.designsRead = function(req, res) {
    
    console.log(req.query.email);
    Design
        .find({'owner': req.query.email})
        .exec(function(err, designs) {
            console.log(designs);
            res.status(200);
            res.json({'designs': designs});
    });  
};

module.exports.designSave = function(req,res) {
    var design = new Design();
    var id;
    if(req.body.id === undefined) {
        design.title = 'test';
        design.owner = req.body.owner;
        design.design = req.body.design;
        design.save(function(err) {
            if(err) throw err;
            console.log('design saved successfully');

        });
        console.log(design._id);
        id = design._id;
    } else {
        Design.findById(req.body.id, function(err, design) {
            if(err) throw err;
            
            design.design = req.body.design;
            
            design.save(function(err) {
                if(err) throw err;
                
                console.log('design updated successfully');
            });
            id = design._id;
        });
        
    }
    res.send(id);
};