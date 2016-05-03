var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var designSchema = new Schema({
    title: String,
    owner: String,
    design: String,
    share: [String]
});

mongoose.model('Design', designSchema);
