var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var designSchema = new Schema({
    title: String,
    owner: String,
    design: String,
    share: [{
        email: String,
        permission: String
    }],
    size: {
        width: Number,
        height: Number
    },
    lastEdit: Date
});

mongoose.model('Design', designSchema);
