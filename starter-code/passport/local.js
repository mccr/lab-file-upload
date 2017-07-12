const passport      = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt        = require("bcrypt");
const User = require('../models/User');
const path = require('path');
const debug = require('debug')('tumblr-lab:'+path.basename(__filename));


passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

passport.use('local-login', new LocalStrategy((username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }
    debug('you are logged in');
    return next(null, user);
  });
}));

passport.use('local-signup', new LocalStrategy(
  { passReqToCallback: true },
  (req, username, password, next) => {
    // To avoid race conditions
    process.nextTick(() => {
        User.findOne({
            'username': username
        }, (err, user) => {
            if (err){ return next(err); }

            if (user) {
                return next(null, false);
            } else {
                // Destructure the body
                const {
                  username,
                  email,
                  password
                } = req.body;
                const picture = {
                  path: `uploads/${req.file.filename}`,
                  name: req.file.originalname
                };
                const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                const newUser = new User({
                  username,
                  email,
                  password: hashPass,
                  picture
                });

                newUser.save((err) => {
                    if (err){ next(null, false, { message: newUser.errors }); }
                    return next(null, newUser);
                });
            }
        });
    });
}));
