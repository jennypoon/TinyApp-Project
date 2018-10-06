var express = require("express");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
var app = express(); //server
var PORT = 8080; // default port 8080

//Cookie
app.use(cookieSession({
  name: 'session',
  keys: ['happy-days']
}))

//POST Body Parser
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

// == Filter user specific URLs
function urlsForUser(id) {
  let filteredUrlDatabase = {};
  for (url in urlDatabase) {
    if (id === urlDatabase[url]['createdBy']) {
      filteredUrlDatabase[url] = urlDatabase[url];
    }
  } return filteredUrlDatabase;
}
console.log(urlsForUser('userID'))

//===Check Cookie = User
function userCookieVerify(cookie) {
  for (user in users) {
    if (cookie == users[user]['id']) {
      return true;
    }
  } return false;
}

//===Random Number Generator
function generateRandomString() {
let randomNum = "";
  const source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    randomNum += source.charAt(Math.floor(Math.random() * source.length));
  }
return randomNum;
}

//Root Page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//MAIN PAGE - DISPLAY FILTERED DATABASE
app.get("/urls", (req, res) => {
  if (userCookieVerify(req.session.user_id)) {
    let templateVars = {
      urls: urlsForUser(req.session.user_id),
      userObj: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
    res.send('Error: You are not authorized, please <a href="/login"> Login </a> or <a href="/register"> Register </a>')
  }
});

//CREATE A NEW LINK
app.get("/urls/new", (req, res) => {
  if (userCookieVerify(req.session.user_id)) {
    let templateVars = {
      userObj: users[req.session.user_id]
    }
    res.render("urls_new", templateVars);
  } else {
    res.send('Error: You are not authorized, please <a href="/login"> Login </a> or <a href="/register"> Register </a>');
  }
});

//UPDATING LONG URL
app.get("/urls/:id", (req, res) => {
  if (userCookieVerify(req.session.user_id)) {
  let templateVars = {
    urlData: urlDatabase[req.params.id],
    userObj: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
  } else {
    res.send('Error: You are not authorized, please <a href="/login"> Login </a> or <a href="/register"> Register </a>');
  }
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = [req.body.newURL];
  res.redirect("/urls");
});

//Short URL redirect to Long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


//CREATE A NEW LINK
app.post("/urls", (req, res) => {
  let newIDNum = generateRandomString();
  urlDatabase[newIDNum] = {
    shortURL: newIDNum,
    longURL: req.body.longURL,
    createdBy: req.session.user_id
  }
  // console.log(urlDatabase)
  // urlDatabase['newIDNum'] = req.body.longURL; //long URL from request body
  // res.redirect("urls/" + newIDNum);
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
    res.status(403).send('Error: Missing Login Details');
    return;
  } else {
    for (let user in users) {
      if (users[user].email === email) {
        if(bcrypt.compareSync(password, hashedPassword)) {
         req.session.user_id = users[user].id;
         res.redirect('/urls');
        }
        return;
      }
    }
  } res.status(403).send('Error - User and Password does not match');
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
});

//REGISTRATION
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  console.log("req.body", req.body);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10);
  let newIDNum = generateRandomString();

  if (email === "" || password === "") {
    res.status(400).send('Error 400: Missing Registration Details');
  } else if (regCheck(req.body.email)) {
    res.status(400).send('Error 400: User already exist');
  } else {
    req.session.user_id = users[newIDNum];

    users[newIDNum] = {
      id: newIDNum,
      email: email,
      password: hashedPassword
    };

    res.redirect("/urls");
  } console.log("userDatabase", users)

});

//PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});