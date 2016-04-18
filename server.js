var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    http = require('http'),
    mongoose = require('mongoose');    
var routes = require('./server/routes/index');
var save = require('./server/routes/save');
var design = require('./server/routes/designRoute');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

app.set('views', __dirname + '/server/views');
app.set('view engine','jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({entended: true}));

app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));

app.get('/design/:id', design.load);
app.use('/', routes);
app.use('/save', save);


mongoose.connect('mongodb://localhost/capstone');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
    console.log('capstone db opened');
})

app.get('/partials/:partialPath', function(req, res) {
    res.render('partials/' + req.params.partialPath);
});

var port = 3000;
app.listen(port, function() {
    console.log('listening on port 3000');
});
