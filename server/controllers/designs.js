var mongoose = require('mongoose');
var Design = mongoose.model('Design');
var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = mailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    secureConnection: true,
    port: 465,
    auth: {
        user: 'admin@unitingdesigners.com',
        pass: 'This is my password'
    }
}));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var mailOptions = {
    from: '"UnitingDesigners',
    to: '',
    subject: 'A project has been shared with you',
    test: 'This user has shared a project with you',
    html: '<p>A user has shared a project with you</p>'
};

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
module.exports.sharedDesign = function(req, res) {
    Design.find({'share': {$elemMatch: {email: req.query.email}}})
        .exec(function(err, designs) {
            console.log(designs);
            res.status(200);
            res.json({'sharedDesigns': designs})
    });
}
module.exports.readDesign = function(req, res) {
    console.log(req.query.id);
    Design.findById(req.query.id, function(err, design) {
        if(err) console.log(err);
        var perm;
        console.log(req.query.email);
        if(design.owner === req.query.email) {
            perm = 'edit';
        } else {
            for(var i = 0; i < design.share.length; i++) {
                if(req.query.email === design.share[i].email) {
                    perm = design.share[i].permission;
                }
            }
        }
        console.log(perm);
        res.status(200);
        res.json({'design': design, 'permission': perm});
    });
};
module.exports.shareDesign = function(req, res) {
    console.log(req.body);
    Design.findById(req.body.id, function(err, design) {
        if(err) console.log(err);
        var userToShare = {email: req.body.email, permission: req.body.permission};
        design.share.push(userToShare);
        design.save(function(err) {
            if(err) console.log(err);
            console.log('design updated successfully');
            mailOptions.to = req.body.email;
            mailOptions.html = '<p>A design has been shared with you. To view the design go to www.unitingDesigners.com/designs/' + design._id + '.</p> <p>Do not reply to this email</p>';
            transporter.sendMail(mailOptions, function(error, response) {
                if(error) {
                    console.log(error);
                } else {
                    console.log('Message sent: ' + response.message);
                }
            });
            res.status(200);
            res.json({shared: design.shared});
        });
    });  
};
module.exports.designSave = function(req,res) {
    var design = new Design();
    var id;
    console.log(req.body);
    if(req.body.id === undefined) {
        design.title = req.body.title;
        design.owner = req.body.owner;
        design.design = req.body.design;
        design.size = req.body.size;
        design.lastEdit = new Date();
        design.save(function(err) {
            if(err) throw err;
            console.log('design saved successfully');
            console.log(design._id);
            id = design._id;
            res.json({'id': id});
        });

    } else {
        Design.findById(req.body.id, function(err, design) {
            if(err) throw err;
            
            design.design = req.body.design;
            design.lastEdit = new Date();
            design.save(function(err) {
                if(err) throw err;
                
                console.log('design updated successfully');
            });
            id = design._id;
            res.status(200);
            res.json({'id': id});
        });
    }
};