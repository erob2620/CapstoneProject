var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');
    

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

app.set('views', __dirname + '/server/views');
app.set('view engine','jade');

app.use(bodyParser.urlencoded({entended: true}));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://localhost/capstone');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
    console.log('capstone db opened');
})

var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);

app.get('/partials/:partialPath', function(req, res) {
    res.render('partials/' + req.params.partialPath);
});

app.get('*', function(req, res) {
    res.render('index');
});
var port = 3000;
app.listen(port, function() {
    console.log('listening on port 3000')
});
