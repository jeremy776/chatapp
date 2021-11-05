const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");
const nodemailer = require("nodemailer");
const csrf = require("csurf");
const bcrypt = require("bcryptjs");
const RD = require("reallydangerous");
const config = require("./config.json");
const fs = require("fs");

const Protection = csrf({
  cookie: true
});
const parser = bodyParser.urlencoded({
  extended: false,
  parameterLimit: 50000,
});
require("dotenv").config();

const UserManager = require("./models/User");
const EmailActivate = require("./models/Activate");

mongoose.connect(process.env.mongourl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// app setup
const ExpressSession = require("express-session")({
  secret: "#jbdisn:3+_8?$)').",
  resave: false,
  saveUninitialized: false
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(cookieParser());
app.use(express.json());
app.use(ExpressSession);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({
  limit: "5mb",
  extended: true
}));
app.use(bodyParser.json({
  limit: "5mb"
}));

// Wihout routes
app.get("/register", Protection, function(req, res) {
  res.render("register.ejs", {
    req,
    res,
    csrfToken: req.csrfToken(),
    config
  });
});

app.get("/login", Protection, function(req, res) {
  res.render("login.ejs", {
    req,
    res,
    csrfToken: req.csrfToken(),
    config
  });
});

app.get("/activate/:id", async function(req, res) {
  let getId = await EmailActivate.findOne({
    id: req.params.id
  });
  if (!getId) return res.sendStatus(404);

  let getUser = await UserManager.findOne({
    email: getId.email
  });
  getUser.isVerified = true;
  getUser.save();

  getId.remove({}, function(err) {
    console.log(`${getId.email} has been verified`);
  });
  req.flash("message", "You can log into your account now");
  return res.redirect("/login");
});

app.post("/new-account", Protection, async function(req, res) {
  let user = req.body;
  /* Create userID */
  let date = new Date();
  let random = function (length) {
    return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
  };
  let year = date.getUTCFullYear();
  let month = ("0" + (date.getUTCMonth()+1)).slice(-2);
  let day = ("0" + date.getUTCDay()).slice(-2);
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

  // set token for activation
  let createToken = new RD.Signer(jam);
  let tokenActivate = createToken.sign(user.username);

  /* Create user token */
  let timestamp = Date.now();
  let timestampEncode = RD.Base64.encode((""+timestamp));
  let idEncode = RD.Base64.encode((""+user.id));
  let passEncode = user.password.split("").slice(-15).join("");
  user.token = `${idEncode}.${timestampEncode}.${passEncode}`;

  let checkUser = await UserManager.findOne({
    email: user.email
  });
  if (checkUser) {
    return res.send({
      status: 403, message: "User already exist"
    });
  }
  // create user
  UserManager.register(new UserManager({
    email: user.email,
    username: user.username,
    id: user.id,
    avatar: null,
    token: user.token,
    about: null,
    friends: [],
    status: "offline",
    isBot: false,
    isDisabled: false,
    isVerified: false,
    last_online: Date.now(),
    badge: []
  }), user.password, async function(err, user) {
    console.log(user);
    // Set email id to user
    const setToken = new EmailActivate({
      email: req.body.email,
      id: tokenActivate
    });
    await setToken.save().catch(err => {
      console.log(err);
    });

    // Get user email id
    const emailToken = await EmailActivate.findOne({
      email: req.body.email
    });
    let fullLink = config.url + "/activate/" + emailToken.id;

    // Send email verify to user email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.account.email,
        pass: process.env.password
      }
    });
    // create options
    const optionsEmail = {
      from: config.account.email,
      to: req.body.email,
      subject: "New account created | Activate your account",
      html: `<!DOCTYPE html><html lang="en"><head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta http-equiv="X-UA-Compatible" content="ie=edge"> <style> body { font-family: sans-serif; color: rgba(0, 0, 0, 0.8); } .brand { color: blue; text-size: 11px; text-decoration: none; font-weight: 500; } p { font-size: 14px; } .end { font-size: 15px; font-weight: 600; margin-top: 20px; text-decoration: underline; } </style></head><body> <h3 class="header-text">Hi Jeremy,</h3> <p> You just created an account at <a href="${config.url}" class="brand">Punicty</a> using this email (${req.body.email}) and now you need to activate your account to be able to log into your account </p> <p> please click the link below here to activate your account. We will delete your account after 24 hours if it is not activated.<br> <a href="${fullLink}">${fullLink}</a> </p> <p> if you feel you didn't create an account today at Punicty just ignore this email.<br> <b>This is an auto email you don't need to reply</b> </p> <p class="end"> - Punicty Team </p></body></html>`
    };
    transporter.sendMail(optionsEmail, (err, info) => {
      if (err) {
        return res.send({
          status: err.status, message: err.message
        });
      }
      return res.send({
        status: 200, message: "Your account has been created"
      });
    });
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("app online!");
});