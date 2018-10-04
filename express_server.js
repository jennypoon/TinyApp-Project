var express = require("express");
var cookieParser = require('cookie-parser')
var app = express(); //server
var PORT = 8080; // default port 8080

//required for cookie
app.use(cookieParser())

//required for POST method
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); //look in view dir for ejs files

//===Random Number Generator
function generateRandomString() {
let randomNum = "";
  const source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    randomNum += source.charAt(Math.floor(Math.random() * source.length));
  }
return randomNum;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//Root Page
app.get("/", (req, res) => {
  res.send("Hello!");
});

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
console.log(users);
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   let templateVars = { greeting: 'Hello World!'} ;
//   res.render("hello_world", templateVars);
// });

//Main Page - display Database
app.get("/urls", (req, res) => {
  username = req.cookies["newUserID"];

  let templateVars = {
    urls: urlDatabase,
    username: username
  };
  res.render("urls_index", templateVars);
});

//Creating New Link
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});
//Specific ID
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id ,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//short url redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Registration
app.get("/register", (req, res) => {
  res.render("register");
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
  urlDatabase[req.params.id] = [req.body.newURL];
  res.redirect("../urls");
});

//login information
app.post("/login", (req, res) => {
  //create a cookie
  console.log(req.body);
  //console.log(req.body[username]); can't access username
  let key = Object.keys(req.body)
  let loginName = req.body[key];
  res.cookie("username", loginName);
  res.redirect("../urls");
});
//logging out
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

//Registration - Save User to Database
app.post("/register", (req, res) => {
  console.log(req.body);
  let email = req.body.email;
  let password = req.body.password;
  let newUserNum = generateRandomString();
  if (email === "" || password === "") {
    res.status(400).send('Error 400: Missing Registration Details');
  } else if (email === users[newUserNum][email]) {
    res.status(400).send('Error 400: User already exist');
  }
    res.cookie("newUserID", newUserNum); //Cookie has a different name
    users[newUserNum] = {
      id: newUserNum,
      email: email,
      password: password
    };
    res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});