const express = require("express");
const router = express.Router();

// @GET
router.get("/", async function(req, res) {
  res.render("me/home.ejs", {
    res,
    req
  });
});

module.exports = router;