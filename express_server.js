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

//===Email Check
function regCheck(email) {
  for(newUserNum in users) {
    if (email === users[newUserNum]['email']){
      return true
    }
  } return false
}
// //== Checking Cookie in Database
// function cookieCheck() {
//   for (let user in users) {
//     if (cookie == userID)
//   }


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
  let templateVars = {
    urls: urlDatabase,
    userObj: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

//Creating New Link
app.get("/urls/new", (req, res) => {
  //check if client is login
  let templateVars = {
    userObj: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);



// } res.status(400).send('Error: You are not authorized, Please <a href="/login"> Login </a>');


});

//Specific ID
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id ,
    longURL: urlDatabase[req.params.id],
    userObj: users[req.cookies["user_id"]]
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
  urlDatabase[req.params.id] = [req.body.newURL];
  res.redirect("../urls");
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
      // console.log(users[user].email)
      if (users[user].email === email && users[user].password === password) {
        res.cookie("user_id", users[user].id).redirect('/urls');
        return;
      }
    }
    res.status(403).send('Error - User and Password does not match');
  }
});

//logging out
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
    // console.log(users);
    res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});