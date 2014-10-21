var express = require('express');
var bodyParser = require('body-parser');
var user = require('./server/user-controller.js');
var app = express();

app.use(express.static(__dirname + '/app'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//user-signin routes
app.post('/users/signin', user.signin);
app.post('/users/signup', user.signup);
app.get('/users/signedin', user.checkAuth);

//if the client is not pinging a user-signin route, 
//then we check if the client is signed in
app.use(user.decode);

//user-picture history changes

//user-preference change routes

//server listen
app.listen(process.env.PORT || '8100');

module.exports = app;
