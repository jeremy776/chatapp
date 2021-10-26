const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");
const csrf = require("csurf");

const Protection = csrf({
  cookie: true
});
const parser = bodyParser.urlencoded({
  extended: false,
  parameterLimit: 50000,
});
require("dotenv").config();


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

server.listen(process.env.PORT || 3000);