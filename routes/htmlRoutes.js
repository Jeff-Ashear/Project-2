var db = require("../models");
var express = require("express");
// var router = express.Router();
var request = require("request");

module.exports = function (app) {

  console.log("in html routes")
  app.get("/", passportAuthenticationMiddleware, function (req, res) {
    let userId = req.user.user.uid
    console.log("REQUEST USER", req.user);
    db.Ingredients.findAll({
      raw: true,
      where: {
        UserId: userId
      }
    }).then(function (ingredients) {
      console.log("Ingredients", ingredients);
      db.Recipes.findAll({
        raw: true,
        where: {
          UserId: userId
        }
      }).then(function(recipes){
        console.log("Recipes", recipes)
        res.render('index', {
          ingredients,
          recipes
        });
      })
    })

    
  });

  // app.get(`/:id`, passportAuthenticationMiddleware, function(req, res) {

  //   getFavorites((stuff)=> {
  //     console.log("The food object from root endpoint", stuff)

  //   res.render('index', {
  //     recipeItems: stuff
  //   });
  // }, req.params.id)
  // });
  // function getFavorites(callback){
  //   var parameters = {
  //     url: "/api/users",
  //     method: "GET",
  //     headers: {
  //       'Content-Type': 'application/json'
  //     }
  //   }
  //   request(parameters, function(error, data){
  //     if (!error && data.statusCode === 200) {
  //       let stuff = JSON.parse(data)
  //        callback(stuff);

  //       }
  //   })
  //   }
  app.get("/login", function (req, res) {
    res.render('login', {});
  });
  app.get("/signup", function (req, res) {
    res.render('signup', {});
  });


  app.get("/ingredients", passportAuthenticationMiddleware, function (req, res) {
    res.render('ingredients', {});
  });
  app.get("/ingredients/:ingredient", passportAuthenticationMiddleware, function (req, res) {

    findIngredients((ingred) => {
      console.log("The food object from root endpoint", ingred)

      res.render('ingredients', {
        foodItems: ingred
      });
    }, req.params.ingredient)
  });

  function findIngredients(callback, iSearch) {

    var queryURL = "https://trackapi.nutritionix.com/v2/search/instant?query=" + iSearch;
    var parameters = {
      url: queryURL,
      method: "GET",
      headers: {
        'x-app-id': '1b56da4f',
        'x-app-key': '1280ff1c8a5c5c57611dce7ae53c9e09'
      }
    }
    request(parameters, function (error, data) {
      if (!error && data.statusCode === 200) {
        let body = JSON.parse(data.body);
        // console.log(body);
        var food = body.branded
        callback(food);

      }
    })
  }

  app.get("/recipe", passportAuthenticationMiddleware, function (req, res) {
    res.render('recipe', {});
  });
  // recipe handlebars
  app.get("/recipe/:ingredient", passportAuthenticationMiddleware, function (req, res) {

    findfood((foodObj) => {
      console.log("The food object from root endpoint", foodObj)

      res.render('recipe', {
        foodItems: foodObj
      });
    }, req.params.ingredient)
  });
  // recipe API function
  function findfood(callback, ingredient) {

    var queryUrl = "http://www.recipepuppy.com/api/?i=" + ingredient;

    request(queryUrl, function (error, data) {
      if (!error && data.statusCode === 200) {
        var food = JSON.parse(data.body).results;

        callback(food);

      }
    });
  }


  // Load example page and pass in an example by id
  app.get("/example/:id", function (req, res) {
    db.Example.findOne({ where: { id: req.params.id } }).then(function (dbExample) {

      res.render("example", {
        example: dbExamples
      });
    });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });
};
// module.exports= router;


const passportAuthenticationMiddleware = (request, response, next) => {
  if (request.user) {
    return next();
  }
  console.log("path in authentication: ", request.url)
  if (request.url == '/signup') {
    return response.redirect('/signup');
  }
  // If the user isn't logged in, redirect them to the login page
  return response.redirect("/login");
}
