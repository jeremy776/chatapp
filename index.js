const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");
const localStrategy = require("passport-local");
const nodemailer = require("nodemailer");
const csrf = require("csurf");
const bcrypt = require("bcryptjs");
const RD = require("reallydangerous");
const config = require("./config.json");
const fs = require("fs");
const sessionShare = require("express-socket.io-session");

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
  secret: "$$&&&##--@67396;jbag",
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
app.use(ExpressSession);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy({
  usernameField: "email",
  passwordField: "password"
}, UserManager.authenticate()));
passport.serializeUser(UserManager.serializeUser());
passport.deserializeUser(UserManager.deserializeUser());

const notAuthenticated = require("./util/NotAuthenticated.js");

// handle web socket using socket.io
const socketio = require("socket.io");
const serverListen = app.listen(process.env.PORT || 3000, function() {
  console.log(`Server Active on port ${process.env.PORT || 3000}`);
});
const io = socketio(serverListen);

// use express shared session
io.use(sessionShare(ExpressSession, {
  autoSave: true
}));

io.on("connection", async function(socket) {
  // make user status to online
  if (socket.handshake.session.passport) {
    let email = socket.handshake.session.passport.user;
    let userDb = await UserManager.findOne({
      email: email
    });
    userDb.last_online = "online";
    await userDb.save();
    console.info(`${userDb.username} - Connected To Server`);
  } else {
    console.warn("Unauthorized user try to connect, but i can handle it");
  }
  socket.on("disconnect", async () => {
    // set user status to offline when disconnect
    if (socket.handshake.session.passport) {
      let user = await UserManager.findOne({
        email: socket.handshake.session.passport.user
      });
      console.info(`${user.username} - Disconnected`);
      user.last_online = Date.now();
      await user.save();
    } else {
      return;
    }
  });
});

// use routes
app.use("/me", require("./router/me.js"));

// Wihout routes
app.get("/", function(req, res) {
  res.redirect("/me");
});

app.get("/register", Protection, notAuthenticated, function(req, res) {
  res.render("register.ejs",
    {
      req,
      res,
      csrfToken: req.csrfToken(),
      config
    });
});

app.get("/login", Protection, notAuthenticated, function(req, res) {
  res.render("login.ejs",
    {
      req,
      res,
      csrfToken: req.csrfToken(),
      config,
      info: req.flash("message"),
      err: req.flash("error")
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

app.post("/login/", Protection, async function(req, res, next) {
  let body = req.body;
  let user = await UserManager.findOne({
    email: body.email
  });
  if (!user) {
    req.flash("error", "Email could not be found");
    return res.redirect("/login");
  }
  if (!user.isVerified) {
    req.flash("message", "Unverified account detected, please check your email to verify. didn't see it? Resend verification email");
    return res.redirect("/login");
  }
  passport.authenticate("local", {
    successRedirect: "/me",
    failureRedirect: "/login",
    failureFlash: true
  })(req, res, next);
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

  bcrypt.genSalt(15, function(err, salt) {
    bcrypt.hash(user.password, salt, async function(err, hash) {
      let hashedPassword = hash;
      /* Create user token */
      let timestamp = Date.now();
      let timestampEncode = RD.Base64.encode((""+timestamp));
      let idEncode = RD.Base64.encode((""+user.id));
      let passEncode = hashedPassword.split("").slice(-15).join("");
      user.token = `${idEncode}.${timestampEncode}.${passEncode}`;

      let checkUser = await UserManager.findOne({
        email: user.email
      });
      if (checkUser) {
        return res.send({
          status: 403,
          message: "This email is already in use",
          id: "email"
        });
      }
      // create user
      UserManager.register(new UserManager({
        email: user.email,
        username: user.username,
        id: user.id,
        avatar: "",
        token: user.token,
        about: "",
        password: hashedPassword,
        friends: [],
        status: "offline",
        isBot: false,
        birthday: user.birthday,
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
          subject: "Activate Account - Punicty",
          html:
          `<!DOCTYPE html><html lang="en"><head> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css" integrity="sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn" crossorigin="anonymous"> <meta charset="UTF-8"> <link rel="preconnect" href="https://fonts.googleapis.com"> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet"> <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap" rel="stylesheet"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta http-equiv="X-UA-Compatible" content="ie=edge"> <style> body { background-color: #e5eaeb; } .container { padding: 15px; } .head-container { background-color: white; padding: 20px 40px 20px 40px; border-radius: 2px; } .header-text { font-family: "Nunito"; font-weight: 800; color: #42445A; } p { font-family: "Nunito"; } .verify-button { padding: 10px; background-color: blue; color: white; border-radius: 5px; font-family: "Poppins"; box-shadow: 2px 2px 1px rgba(0,0,0,0.2); font-size: 12px; margin: 20px 10px 10px 10px; border: none; font-weight: 600; outline: none; } .verify-button:hover { color: white; text-decoration: none; } </style></head><body> <div class="container"> <div class="head-container"> <h4 class="header-text">Hello ${req.body.username},</h4> <p> You just created an account on Punicty using this email (${req.body.email}), now is the time to verify your email. Click the button below to verify your email as soon as possible. The buttons below will no longer work after 24 hours. </p> <p><br/> <center><a href="${fullLink}" class="verify-button">Verify Email</a></center> </div> </div></body></html>`
        };
        transporter.sendMail(optionsEmail, (err, info) => {
          if (err) {
            return res.send({
              status: err.status, message: err.message
            });
          }
          req.flash("message", "Please check your email to verify account");
          return res.send({
            status: 200, message: "Your account has been created"
          });
        });
      });
    });
  });
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err: {};
});