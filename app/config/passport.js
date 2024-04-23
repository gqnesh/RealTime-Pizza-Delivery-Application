const mongoose = require('mongoose');
const UserModel = require('../models/userModel');
const bcrypt = require("bcryptjs");

const LocalStrategy = require('passport-local').Strategy;

const passportInit = (passport) => {
  //first arg. is define userField and second is cb()
  passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    //Login
    //check if email exists
    const user = await UserModel.findOne({ email: email })
    if (!user) {
      return done(null, false, { message: "No user with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: "Invalid Credentials" });
    }

    done(null, user, { message: "Logged in Successfully !" });

  }));


  //serializeUser
  passport.serializeUser((user, done) => {
    done(null, user._id);

    // Passport will pass the authenticated_user to serializeUser as "user"
    // This is the USER object from the done() in auth function
    // Now attach using done (null, user.id) tie this user to the req.session.passport.user = {id: user.id},
    // so that it is tied to the session object
  });


  passport.deserializeUser(async (id, done) => {

    const userID = await UserModel.findById({ _id: new mongoose.Types.ObjectId(id) });
    if (!userID) {
      done(userID, false, { message: "No user found" })
    }
    done(null, userID);

    // This is the id that is saved in req.session.passport.{ user: "id"} during the serialization
    // use the id to find the user in the DB and get the user object with user details
    // pass the USER object in the done() of the de-serializer
    // this USER object is attached to the "req.user", and can be used anywhere in the App.

  });

  // In our case, since after calling the done() in "serializeUser" we had req.session.passport.user.{id: 123, name: "Kyle"},
  // calling the done() in the "deserializeUser" will take that last object that was attached to req.session.passport.user.{..} and attach to req.user.{..}
  //   i.e.req.user.{ id: 123, name: "Kyle" }
  //   3. So "req.user" will contain the authenticated user object for that session, and you can use it in any of the routes in the Node JS app.
  //     eg.
  //     app.get("/dashboard", (req, res) => {
  //       res.render("dashboard.ejs", { name: req.user.name })
  //     })




}

/* 

The req.logIn() method is not provided by the Express.js framework itself but is instead a method provided by Passport.js, which is a middleware used for authentication in Node.js applications.

When you configure Passport.js using passport.use(new LocalStrategy(...)), you define a strategy for authenticating users. In your case, you're using the LocalStrategy, which is a strategy for authenticating with a username and password.

When you call passport.authenticate('local', ...), Passport.js middleware kicks in. It's responsible for matching credentials (in this case, email and password) against the strategy you defined earlier. If authentication is successful, Passport.js will establish a session for the user, and req.logIn() is what Passport.js uses internally to serialize the user into the session.

Here's a breakdown of how it works:

When a user attempts to log in, the passport.authenticate('local', ...) middleware is invoked.
Inside the local strategy callback (passport.use(new LocalStrategy(...))), Passport.js checks the credentials provided by the user.
If the credentials are valid, Passport.js invokes the done callback with the authenticated user object as the second argument (done(null, user)).
Passport.js then calls req.logIn(user, ...) internally, which is a method provided by Passport.js to establish a login session.
Inside req.logIn, Passport.js calls the serializeUser method you defined earlier (passport.serializeUser((user, done) => {...})), where you serialize the user into the session.
So, req.logIn() is essentially part of the Passport.js authentication process, allowing it to manage user sessions and authentication state within your Express.js application.

*/


module.exports = passportInit;
