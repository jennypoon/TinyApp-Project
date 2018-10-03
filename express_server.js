var express = require("express");
var app = express(); //server
var PORT = 8080; // default port 8080

//===Random Number Generator
function generateRandomString() {
var randomNum = "";
  var source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    randomNum += source.charAt(Math.floor(Math.random() * source.length));
  }
return randomNum;
}

//required for POST method
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); //look in view dir for ejs files

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   let templateVars = { greeting: 'Hello World!'} ;
//   res.render("hello_world", templateVars);
// });

//for /urls, display Database
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//for urls/new - form to enter new urls
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//when given id, show short and long url
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id ,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//short url redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//when receive urls, should add to database and redirect
app.post("/urls", (req, res) => {
  let newIDNum = generateRandomString();
  urlDatabase[newIDNum] = req.body.longURL; //long URL from request body
  res.redirect("urls/" + newIDNum);

  // console.log(req.body);  // debug statement to see POST parameters
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});