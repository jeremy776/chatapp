const express = require("express");
const router = express.Router();
const isLogin = require("../util/Authenticated");
const config = require("../config.json");

router.get("/", isLogin, async function(req, res) {
  res.render("me/home.ejs", {
    res,
    req,
    config
  });
});

router.get("/chat", isLogin, async function(req, res) {
  res.render("me/chat.ejs", {
    res,
    req,
    config
  });
});

router.get("/friends", isLogin, async function(req, res) {
  res.render("me/friends.ejs", {
    res,
    req,
    config
  });
});

router.get("/profile", isLogin, async function(req, res) {
  res.render("me/profile", {
    res,
    req,
    config
  });
});

module.exports = router;