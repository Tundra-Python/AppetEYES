var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var user = require('./server/user-controller.js');
var imageInfo = require('./server/image-restaurant-controller.js');
var image = require('./server/image-controller.js');
var yelp = require('./server/api/yelp.controller.js');
var app = express();

app.use(express.static(__dirname + '/app'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
console.log('Starting APP');

//Mongo DB Connection
var mongoUrl = process.env.port ? "mongodb://MongoLab-s:mFZxpWu8Pi.eNBqD4fBHxSXXg0DI.egdrUzjN8j3lsA-@ds041157.mongolab.com:41157/MongoLab-s" : 'mongodb://localhost/appteys';
mongoose.connect(mongoUrl);

//user-signin routes
app.post('/users/signin', user.signin);
app.post('/users/signup', user.signup);
app.get('/users/signedin', user.checkAuth);

//if the client is not pinging a user-signin route, 
//then we check if the client is signed in
app.use(user.decode);

//get yelp search results
app.get('/yelp/*', yelp.refinedSearch);

//user-picture history changes
app.get('/users/likes', imageInfo.getUserLikes);
app.post('/users/likes', imageInfo.saveUserLikes);

//user-preference change routes
app.get('/users/preferences', imageInfo.getUserPreferences);
app.post('/users/preferences', imageInfo.changeUserPreferences);

//restaurant information
app.get('/restaurant/info', imageInfo.getRestaurantInfo);
app.post('/restaurant/info', image.saveRestaurant);

//server listen
app.listen(process.env.PORT || '8080');

module.exports = app;
