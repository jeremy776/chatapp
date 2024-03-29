const express = require("express");
const router = express.Router();
const version = "v1";
const ManagerAccount = require("../../models/User");
const rateLimit = require("express-rate-limit");
const config = require("../../config.json");

router.get("/", async function(req, res) {
  res.send({status: 200, message: "Welcome mate!", version});
});

// edit limit
const editNameLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  statusCode: 403,
  message: "Too_many_renames,_try_again_later"
});

// edit username
// Soon update -> users/@me (type patch)

router.patch("/username", editNameLimit, async function(req, res) {
  let token = req.headers.authorization;
  if(!token) {
    return res.status(403).send({
      status: 403,
      message: "Cannot read property `authorization` expecting a string, but getting undefined"
    });
  }
  let user = await ManagerAccount.findOne({
    token: token
  });
  if(!user) {
    return res.status(403).send({
      status: 403,
      message: "Authorization is invalid, make sure the token given is correct"
    });
  }
  
  let body = req.body;
  user.username = body.username;
  user.save();
  
  let socket = req.app.get("io").sockets;
  socket.emit("frontend-username-change", {
    username: body.username,
    id: user.id
  });
  
  return res.send({
    username: user.username
  });
});



/* API FOR BOT - BETA */

// Login to bot
router.post("/bots/connect", async function(req, res) {
  let token = req.headers.authorization;
  if(!token) {
    return res.status(403).send({
      status: 403,
      message: "authorization is undefined, which expects a string"
    });
  }
  
  let bot = await ManagerAccount.findOne({
    token
  });
  if(bot.isBot) {
    return res.status(403).send({
      status: 403,
      message: "Forbidden tokens. make sure it's bot token not user token"
    });
  }
  
  let socket = req.app.get("io").sockets;
  socket(config.url, {
    auth: {
      token: bot.token
    },
    transports: ["websockets"]
  });
  return res.send({
    status: 200,
    message: bot
  });
});
// Ends of Api Bot

module.exports = router;