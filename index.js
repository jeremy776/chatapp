const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");
const csrf = require("csurf");
const bcrypt = require("bcryptjs");
const RD = require("reallydangerous");
const config = require("./config.json");

const Protection = csrf({
  cookie: true
});
const parser = bodyParser.urlencoded({
  extended: false,
  parameterLimit: 50000,
});
require("dotenv").config();

const UserManager = require("./models/User");

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

app.post("/new-account", Protection, function(req, res) {
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

  bcrypt.genSalt(15, (err, salt) => {
    bcrypt.hash(user.password, salt, async (err, hash) => {
      user.password = hash;
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
        isVerified: false,
        last_online: Date.now(),
        badge: []
      }), user.password, async function(err, user) {
        console.log("New account has been created");
        console.log(user);
        return res.send({
          status: 200, message: "Your account has been created"
        });
      });
    });
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("app online!");
});