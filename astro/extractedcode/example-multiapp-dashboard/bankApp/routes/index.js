const express = require("express");
const passport = require("passport");
const router = express.Router();

function checkAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/login");
  return next();
}

router.get("/", function (req, res, next) {
  if (req.isAuthenticated()) return res.redirect("/account");
  res.render("index", {});
});

router.get("/login", passport.authenticate("oauth2"));

router.get(
  "/auth/callback",
  passport.authenticate("oauth2", {
    successRedirect: "/account",
    failureRedirect: "/",
  }),
);

router.get("/logout", function (req, res, next) {
  req.logOut(() => {
    res.redirect("/");
  });
});

router.get("/account", checkAuthenticated, function (req, res, next) {
  res.render("account", { email: req.user });
});

module.exports = router;
