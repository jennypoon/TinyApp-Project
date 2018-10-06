//MIDDLEWARE
var express = require("express");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
var app = express();
var PORT = 8080;

//COOKIE
app.use(cookieSession({
  name: 'session',
  keys: ['happy-days']
}))

//POST Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

//DATABASES
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

//=== VERIFICATION - check email in database
function regCheck(email) {
  for(newUserNum in users) {
    if (email === users[newUserNum]['email']){
      return true
    }
  } return false
}

//=== VERIFICATION - Check cookie match User ID
function userCookieVerify(cookie) {
  for (user in users) {
    if (cookie == users[user]['id']) {
      return true;
    }
  } return false;
}

//=== Filtered User-Specific URL Database
function urlsForUser(id) {
  let filteredUrlDatabase = {};
  for (url in urlDatabase) {
    if (id === urlDatabase[url]['createdBy']) {
      filteredUrlDatabase[url] = urlDatabase[url];
    }
  } return filteredUrlDatabase;
}

//=== RANDOM NUMBER GENERATOR
function generateRandomString() {
let randomNum = "";
  const source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    randomNum += source.charAt(Math.floor(Math.random() * source.length));
  }
return randomNum;
}

//ROOT PAGE
app.get("/", (req, res) => {
  if (userCookieVerify(req.session.user_id)) {
    res.redirect("/urls");
    return;
  } res.redirect("/login");
});

//HOME PAGE - DISPLAY FILTERED DATABASE
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    userObj: users[req.session.user_id]
    };
  res.render("urls_index", templateVars);
});

//CREATE A NEW LINK
app.get("/urls/new", (req, res) => {
  if (userCookieVerify(req.session.user_id)) {
    let templateVars = {
      userObj: users[req.session.user_id]
    }
    res.render("urls_new", templateVars);
    return;
  } else {
    res.redirect("/login");
    return;
  }
});

//UPDATING LONG URL
app.get("/urls/:id", (req, res) => {
  filteredDatabase = urlsForUser(req.session.user_id);
  if (userCookieVerify(req.session.user_id)) {
    let templateVars = {
      urls: filteredDatabase[req.params.id],
      userObj: users[req.session.user_id]
   };
    res.render("urls_show", templateVars);
    return;
  } else {
    res.send('Error: No Authorization. Please <a href="/login"> Login </a> or <a href="/register"> Register </a>');
    return;
  }
});

app.post("/urls/:id", (req, res) => {
  if (!req.body.newURL) {
    res.send('Error: Oops! You forgot to type something! Go <a href="/urls">back </a>');
    return;
  } else {
    urlDatabase[req.params.id].longURL = [req.body.newURL];
    res.redirect("/urls");
  }
});

//SHORT LINK REDIRECT TO LONG LINK - For Sharing, not actively used
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]['longURL']);
});


//CREATE A NEW LINK
app.post("/urls", (req, res) => {
  if (!req.body.longURL) {
    res.send('Error: Oops! You forgot to type something! Go <a href="/urls/new">back </a>');
    return;
  }
  let newIDNum = generateRandomString();
  urlDatabase[newIDNum] = {
    shortURL: newIDNum,
    longURL: req.body.longURL,
    createdBy: req.session.user_id
  };
 res.redirect("urls/");
});

//DELETE URL FROM DATABASE
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//LOGIN
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10);
  if (email === "" || password === "") {
    res.status(403).send('Error: Missing login details, go <a href="/login"> back </a>');
    return;
  } else {
    for (let user in users) {
      if (users[user].email === email) {
        if (bcrypt.compareSync(password, hashedPassword)) {
         req.session.user_id = users[user].id;
         res.redirect('/urls');
        };
        return;
      }
    }
  } res.status(403).send('Error - Username and Password does not match, go <a href="/login"> back </a>');
});

//REGISTRATION
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10);
  let newIDNum = generateRandomString();
  if (email === "" || password === "") {
    res.status(400).send('Error 400: Missing Registration Details, go <a href="/register"> back </a>');
  } else if (regCheck(req.body.email)) {
    res.status(400).send('Error 400: User already exist, go<a href="/register"> back </a>or<a href="/login"> Login </a>');
  } else {
    req.session.user_id = users[newIDNum];

    users[newIDNum] = {
      id: newIDNum,
      email: email,
      password: hashedPassword
    };

    res.redirect("/urls");
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//PORT
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});