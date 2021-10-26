const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");

server.listen(process.env.PORT || 3000);