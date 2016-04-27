var express = require('express'),
    logger = require('morgan'),
    path = require('path'),
    bodyParser = require('body-parser'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    passport = require('passport');
require('./server/models/db');
require('./server/config/passport');

//var routes = require('./server/routes/index');
//var save = require('./server/routes/save');
//var design = require('./server/routes/designRoute');
var routesApi = require('./server/routes/index');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine','jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({entended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.static(path.join(__dirname + '/app_client')));
app.use(passport.initialize());




//app.get('/design/:id', design.load);
//app.use('/', routes);
//app.use('/save', save);
app.use('/api', routesApi);
app.use(function(req,res) {
    res.sendFile(path.join(__dirname,'app_client','index.html'));
});
//
//app.get('/partials/:partialPath', function(req, res) {
//    res.render('partials/' + req.params.partialPath);
//});

app.use(function(err,req,res,next) {
    if(err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({'message' : err.name + ': ' + err.message});
    }
});

var port = 3000;
app.listen(port, function() {
    console.log('listening on port 3000');
});
