var mongoose = require('mongoose');
var Design = mongoose.model('Design');

module.exports.designsRead = function(req, res) {
    
    if(!req.payload._id) {
        res.status(401).json({
            'message' : 'UnauthorizedError: private profile'
            
        });
        
    } else {
        Design
            .findById(req.payload.email)
            .exec(function(err, designs) {
                res.status(200).json(designs);
        });
    }
};

//module.exports.designSave = funtion(req,res) {
//    var design = new Design();
//    
//    design.title = 'test';
//    design.owner = req.payload.email;
//    design.design = req.
//};