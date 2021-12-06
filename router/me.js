const express = require("express");
const router = express.Router();
const isLogin = require("../util/Authenticated");
const config = require("../config.json");

// @GET
router.get("/", isLogin, async function(req, res) {
  res.render("me/home.ejs", {
    res,
    req,
    config
  });
});

// @GET
router.get("/chat", isLogin, async function(req, res) {
  res.render("me/chat.ejs", {
    res,
    req,
    config
  });
});

// @GET
router.get("/friends", isLogin, async function(req, res) {
  res.render("me/friends.ejs", {
    res,
    req,
    config
  });
});

// @GET
router.get("/profile", isLogin, async function(req, res) {
  res.render("me/profile", {
    res,
    req,
    config
  });
});

module.exports = router;