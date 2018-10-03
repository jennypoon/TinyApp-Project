var express = require("express");
var app = express(); //server
var PORT = 8080; // default port 8080

//===Random Number Generator
function generateRandomString() {
let randomNum = "";
  const source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    randomNum += source.charAt(Math.floor(Math.random() * source.length));
  }
return randomNum;
}

//required for POST method
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); //look in view dir for ejs files

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//Root Page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   let templateVars = { greeting: 'Hello World!'} ;
//   res.render("hello_world", templateVars);
// });

//Main Page - display Database
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Creating New Link
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//Specific ID
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

//Create new item in Database
app.post("/urls", (req, res) => {
  let newIDNum = generateRandomString();
  urlDatabase[newIDNum] = req.body.longURL; //long URL from request body
  res.redirect("urls/" + newIDNum);
});

//Delete URL from Database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Update URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = [req.body.newURL]
  console.log[urlDatabase];
  res.redirect("../urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});