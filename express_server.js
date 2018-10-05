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


const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    createdBy: "userID"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    createdBy: "userID2"
  }
}

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

//===Email Check
function regCheck(email) {
  for(newUserNum in users) {
    if (email === users[newUserNum]['email']){
      return true
    }
  } return false
}
// == Checking if User in Database
function urlsForUser(id) {
  let filteredDatabase = {};
  for (url in urlDatabase) {
    if (id === urlDatabase[url]['createdBy']) {
      filteredDatabase[url] = urlDatabase[url];
    }
  } return filteredDatabase;
}
console.log(urlsForUser('userID'))

//===Random Number Generator
function generateRandomString() {
let randomNum = "";
  const source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    randomNum += source.charAt(Math.floor(Math.random() * source.length));
  }
return randomNum;
}

//Main Page - display Database
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      urls: urlsForUser(req.cookies["user_id"]),
      userObj: users[req.cookies["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else {
    res.send('Error: You are not authorized, please <a href="/login"> Login </a> or <a href="/register"> Register </a>')
  }
});

//Creating New Link
app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      userObj: users[req.cookies["user_id"]]
    }
    res.render("urls_new", templateVars);
  } else {
    res.send('Error: You are not authorized, please <a href="/login"> Login </a> or <a href="/register"> Register </a>');
  }
});

//Specific ID
app.get("/urls/:id", (req, res) => {
  if (req.cookies["user_id"]) {
  let templateVars = {
    urlData: urlDatabase[req.params.id],
    userObj: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
  } else {
    res.send('Error: You are not authorized, please <a href="/login"> Login </a> or <a href="/register"> Register </a>');
  }
});

//short url redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


//Create new item in Database
app.post("/urls", (req, res) => {
  let newIDNum = generateRandomString();
  urlDatabase[newIDNum] = {
    shortURL: newIDNum,
    longURL: req.body.longURL,
    createdBy: req.cookies["user_id"]
  }
  console.log(urlDatabase)
  // urlDatabase['newIDNum'] = req.body.longURL; //long URL from request body
  // res.redirect("urls/" + newIDNum);
  res.redirect("urls/");
});

//Delete URL from Database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Updating URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = [req.body.newURL];
  res.redirect("/urls");
});

//Login
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log("login", users);
  if (email === "" || password === "") {
    res.status(403).send('Error: Missing Login Details');
    return;
  } else {
    for (let user in users) {
      if (users[user].email === email && users[user].password === password) {
        res.cookie("user_id", users[user].id).redirect('/urls');
        return;
      }
    }
    res.status(403).send('Error - User and Password does not match');
  }
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//Registration - Save User to Database
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let newUserNum = generateRandomString();
  res.cookie("user_id", newUserNum);

  if (email === "" || password === "") {
    res.status(400).send('Error 400: Missing Registration Details');
  } else if (regCheck(req.body.email)) {
    res.status(400).send('Error 400: User already exist');
  } else {
    users[newUserNum] = {
      id: newUserNum,
      email: email,
      password: password
    };
  }
    res.redirect("/urls");
});

//PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});