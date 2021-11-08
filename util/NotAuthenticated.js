function notAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return next();
  return res.redirect("/me");
}

module.exports = notAuthenticated;