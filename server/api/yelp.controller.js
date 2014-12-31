'use strict';

var Yelp = require("yelp").createClient({
  consumer_key: "6aF2JYQRdQrbgRQHYkK86w", 
  consumer_secret: "b0hAqq9PriGum0aEcCggGIHE8pA",
  token: "4DjcSZE8GvNMNx3Z2un5pX5zW60fIEjK",
  token_secret: "adG7at7uR42AVbSeV6zEjshFRdE"
});

exports.refinedSearch = function(req, res) {
  //Receives request made by the YELPER service with category * location
  // console.log('This is your request sir', req.params);
  //Parses the request to separate Category from Location

  var categoryMap = {
    Restaurants: 'restaurants',
    Italian: 'italian',
    Thai: 'thai',
    American: 'tradamerican',
    French: 'french',
    Japanese: 'japanese',
    Chinese: 'chinese',
    Seafood: 'seafood',
    Ethopian: 'ethopian',
    Burmese: 'burmese',
    Mexican: 'mexican',
    Mediterranean: 'mediterranean',
    'Middle Eastern': 'mideastern',
    'Soul Food': 'soulfood',
    Korean: 'korean',
    Brazilian: 'brazilian',
    German: 'german',
  };

  var term = 'Food';
  var location = req.body.location;
  var offset = req.body.offset;
  var categories = '';

  for (var i=0; i<req.body.categories.length; i++){
    categories += categoryMap[req.body.categories[i]] += ',';
  }
  categories = categories.slice(0,-1);

  var yelpParams = {
    term: term,
    location: location,
    category_filter: categories,
    offset: offset
  }

  Yelp.search(yelpParams, function(error, data) {
    if (error) console.log('ERROR IN YELP CONTROLLER', error);
    var result = data;
    var arr = [];
    for(var i =0 ; i < result.businesses.length;i++ ){
      // console.log('This is your data',result['businesses'][i].image_url.replace('ms.jpg','l.jpg'),result['businesses'][i].id);
      arr.push({
        link:result.businesses[i].image_url.replace('ms.jpg','l.jpg'),
        name:result['businesses'][i].name,
        phone:result['businesses'][i].phone,
        address:result['businesses'][i].location.display_address,
        mobileUrl:result['businesses'][i].mobile_url,
        rating:result['businesses'][i].rating_img_url_small,
        neighborhoods:result['businesses'][i].location.neighborhoods,
        city:result['businesses'][i].location.city
      });
    }
    
    return res.json(200, arr);
  });
};
