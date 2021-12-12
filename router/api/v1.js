const express = require("express");
const router = express.Router();
const version = "v1";
const ManagerAccount = require("../../models/User");
const rateLimit = require("express-rate-limit");

router.get("/", async function(req, res) {
  res.send({status: 200, message: "Welcome mate!", version});
});


const editNameLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  statusCode: 403,
  message: "Too_many_renames,_try_again_later"
});
// edit username
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
  
  /*req.io.socket.emit("api-username-change", {
    username: body.username
  });*/
  
  let socket = req.app.get("io").sockets;
  socket.emit("frontend-username-change", {
    username: body.username
  });
  
  return res.send({
    username: user.username
  });
});

module.exports = router;