const jwt = require("jwt-simple");

const User = require("../models/user");
const config = require("../config");

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signup = function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(422)
      .send({ error: "You must provide email and password" });
  }

  // Search the user
  User.findOne({ email: email }, (err, existingUser) => {
    // if error
    if (err) {
      return next(err);
    }

    // if user exist
    if (existingUser) {
      return res.status(422).send({ error: "Email is in use" });
    }

    // create the user in memory
    const user = new User({
      email,
      password,
    });

    // save the user
    user.save((err) => {
      if (err) {
        return next(err);
      }
      res.json({ token: tokenForUser(user) });
    });
  });
};

exports.signin = function (req, res, next) {
  // user has already had their email and password auth'd by the local interceptor/middleware
  // return a token
  res.send({ token: tokenForUser(req.user) });
};
