const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');
// use the mongoose tool above instead of:
// const User = require("../models/User");
// this will avoid testing issues when multi models are required

passport.serializeUser((user, done) => {
  done(null, user.id);
});
//this is the 'user' that we found using passport.use

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      // 'done' is a callback function
      const existingUser = await User.findOne({ googleId: profile.id });
      // use "await" to deal with the async promise 'User.findOne({ googleId: profile.id })'
      if (existingUser) {
        return done(null, existingUser);
      }
      // we don't have a user record with thei ID, make a new record!
      const user = await new User({ googleId: profile.id }).save();
      done(null, user);
    }
  )
);
