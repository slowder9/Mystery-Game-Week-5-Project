const express = require("express");
const mustache = require("mustache-express");
const fs = require("fs");
const bodyparser = require("body-parser")
const session = require("express-session")

const server = express();

const users = [
  { username: "Erin", score: 1, tries: 8 },
  { username: "Michael", score: 2, tries: 8 }
]

let randoWordSplit = null;
let randoWordDashes = null;
let words = null;

//Configure Server
server.use(bodyparser.urlencoded({ extended: false }));
server.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
}));

server.engine("mustache", mustache());
server.set("views", "./views")
server.set("view engine", "mustache");

//GET requests
server.get("/", function(req, res) {
  res.render("start");
})

server.get("/play", function(req, res) {
  if (req.session.who !== undefined) {
    res.render("mysteryword", {
      username: req.session.who.username,
      tries: req.session.who.tries,
      guessedLetters: req.session.who.guesses,
      score: req.session.who.score,
      underscores: req.session.who.underscores
    });
  } else {
    res.redirect("/")
  }
});

server.get("/end", function(req, res) {
  res.render("end");
})

server.get("/win", function(req, res) {
  res.render("win")
})

//POST requests
server.post("/", function(req, res) {
  res.redirect("/");
})

server.post("/start", function(req, res) {
  const username = req.body.newPlayer;
  if (username !== null) {
    let user = {
      username: req.body.newPlayer,
      score: 0,
      tries: 8,
      guessedLetters: [""],
    };

    users.push(user);
    req.session.who = user;

    words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n")
    req.session.who.randoWord = words[Math.floor(Math.random()*words.length)];
    randoWordSplit = req.session.who.randoWord.split("");
    randoWordDashes = Array(randoWordSplit.length + 1).join("_").split("");
    req.session.who.underscores = randoWordDashes;

    console.log(randoWordSplit);

    res.redirect("/play")
    } else {
      res.redirect("/")
      }
})

server.post("/guess", function(req, res) {
  let makeLowercase = req.body.guess.toLowerCase();

  if ((req.session.who.tries > 1) && (makeLowercase !== "")) {
    req.session.who.tries -= 1;
    req.session.who.guessedLetters.push(makeLowercase);

    while (randoWordSplit.indexOf(makeLowercase) !== -1 && req.session.who.underscores.indexOf("_") > -1) {
      req.session.who.score += 5;
      let index = randoWordSplit.indexOf(makeLowercase);
      req.session.who.underscores[index] = randoWordSplit[index];
      randoWordSplit[index] = "";
    }

    if (req.session.who.underscores.indexOf("_") === -1) {
      res.redirect("/win");
    } else {
      res.redirect("/play");
    }

  } else if (req.body.guess === "") {
    res.redirect("/play");

  } else {
    req.session.destroy();
    res.redirect("/end")
  }
})

server.listen(3008, function() {
   console.log("hey hey");
})