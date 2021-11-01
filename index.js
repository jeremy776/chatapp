const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");
const csrf = require("csurf");
const bcrypt = require("bcryptjs");

const Protection = csrf({
  cookie: true
});
const parser = bodyParser.urlencoded({
  extended: false,
  parameterLimit: 50000,
});
require("dotenv").config();

//const UserManager = require("./models/User");

// server serup
const ExpressSession = require("express-session")({
  secret: "#jbdisn:3+_8?$)').",
  resave: false,
  saveUninitialized: false
});

server.set("views", path.join(__dirname, "views"));
server.set("view engine", "ejs");
server.use(express.static(path.join(__dirname, 'public')));
server.use(flash());
server.use(cookieParser());
server.use(express.json());
server.use(ExpressSession);
server.use(passport.initialize());
server.use(passport.session());
server.use(express.urlencoded({
  limit: "5mb",
  extended: true
}));
server.use(bodyParser.json({
  limit: "5mb"
}));

// Wihout routes
server.get("/register", function(req, res) {
  res.render("register.ejs", {
    req,
    res
  });
});

server.post("/new-account", function(req, res) {
  let user = req.body;

  /* Create userID */
  let date = new Date();
  let random = function (length) {
    return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
  };
  let year = date.getFullYear();
  let month = ("0" + (date.getMonth()+1)).slice(-2);
  let day = ("0" + date.getDay()).slice(-2);
  let second = ("0" + date.toLocaleString('en-US', {
    second: "numeric",
    hour12: false
  })).slice(-2);
  let minute = ("0" + date.toLocaleString("en-US", {
    minute: "numeric",
    hour12: false
  })).slice(-2);
  let hour = ("0" + date.toLocaleString("en-US", {
    hour: "numeric",
    hour12: false
  })).slice(-2);
  let jam = `${hour}${minute}${second}`;
  let halfId = `${year}${month}${day}${jam}`;
  user.id = `${halfId}${random(6)}`;

  bcrypt.genSalt(15, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      console.log(user);
    });
  });
});

server.listen(process.env.PORT || 3000, function() {
  console.log("Server online!");
});