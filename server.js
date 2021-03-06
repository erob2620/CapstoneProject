var express = require('express'),
    app = express(),
    logger = require('morgan'),
    path = require('path'),
    bodyParser = require('body-parser'),
    http = require('http').Server(app),
    cookieParser = require('cookie-parser'),
    passport = require('passport');
require('./server/models/db');
require('./server/config/passport');

//var routes = require('./server/routes/index');
//var save = require('./server/routes/save');
//var design = require('./server/routes/designRoute');
var routesApi = require('./server/routes/index');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var sio = require('socket.io').listen(http);

var namespaces = [
    sio.of('/design')
];

namespaces.forEach(function(element, index, array) {
    console.log(element.name)
    element.on('connect', function(socket) {
        console.log('someone joined in socket: ' + element.name);
        socket.room = socket.handshake.query.room;
        var user = socket.handshake.query.name;
        console.log(socket.handshake.query);
        console.log(user);
        socket.join(socket.room, function(err) {
            if(err) console.log(err);
            console.log(socket.rooms);
        });
        socket.broadcast.to(socket.room).emit('updateGroup', user + ' has joined the design');
        
        socket.on('updateDesign', function(design) {
            socket.broadcast.to(socket.room).emit('designUpdate', design); 
        });
        socket.on('deleteShape', function(toRemove) {
            socket.broadcast.to(socket.room).emit('shapeToRemove', toRemove); 
        });
        socket.on('sendMessage', function(msg) {
            socket.emit('messageRecieved', msg);
            socket.broadcast.to(socket.room).emit('messageRecieved', msg); 

        });
        socket.on('addShape', function(toAdd) {
            socket.broadcast.to(socket.room).emit('shapeToAdd', toAdd);
        });
    });
});

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

var port = 8080;
http.listen(port, function() {
    console.log('listening on port 8080');
});
