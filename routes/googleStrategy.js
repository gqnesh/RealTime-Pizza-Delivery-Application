const express = require('express');
const router = express.Router();
const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('../app/models/userModel');
const mongoose = require('mongoose')

passport.use(new googleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
  async function (accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });


    try {
      const newUser = {
        GID: profile.id,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        email: profile.emails[0].value
      }


      let user = await UserModel.findOne({ GID: profile.id });
      if (user) {
        done(null, user)
      } else {
        try {
          const checkUser = await UserModel.exists({ email: profile.emails[0].value });
          if (checkUser) {
            throw new Error('User already exists !')
          }
          user = new UserModel(newUser);
          user = await user.save();
          done(null, user);
        } catch (error) {
          done(error, false, { message: 'User already exists !' });
        }
      }

    } catch (error) {
      console.log('error.name - ', error.name);
      console.log('error.message - ', error.message);
      console.log('error - ', error);
    }
  }
));

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/home/register',
    successRedirect: '/home/orders'
  }),

);


// destroy user session
router.get('/logout', async (req, res) => {
  try {

    req.session.destroy((err) => {
      if (err) {

        console.log('error.name - ', error.name);
        console.log('error.message - ', error.message);

        res.status(500).send('Error destroying server...');
      } else {
        console.log('req.session - ', req.session);
        // console.log('session destroyed successfully !);
        res.redirect('/');
      }


    })
  } catch (error) {
    console.log('logout session error');
    console.log(error.name);
    console.log(error.msg);
    res.status(500).send('logout session error');
  }
})


// persist user data after successful authentication
passport.serializeUser((user, done) => {
  console.log('user1 - ', user)
  done(null, user.id);
})

// retrieve user data from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById({ _id: new mongoose.Types.ObjectId(id) });
    done(null, user)
  } catch (error) {
    done(error, false, { message: 'No user found...!' })
  }
})


module.exports = router;