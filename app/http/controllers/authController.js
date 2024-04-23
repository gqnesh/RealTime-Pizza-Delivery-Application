const UserModel = require("../../models/userModel");
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const passport = require("passport");

const registerPage = async (req, res) => {
  try {

    res.render("auth/register");

  } catch (error) {

    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      errorName: error.name,
      errorMsg: error.message
    })

  }
};

const loginPage = async (req, res) => {
  try {

    res.render("auth/login");

  } catch (error) {

    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      errorName: error.name,
      errorMsg: error.message
    })

  }
}

// registration method
// login Method

const register = async (req, res) => {
  try {

    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {

      req.flash("firstname", firstname);
      req.flash("lastname", lastname);
      req.flash("email", email);
      req.flash("error", "All fields are required !");

      res.redirect("/home/register");

    }

    //check if email exists

    if (firstname && lastname && email && password) {

      // const checkUser = await UserModel.findOne({ email: email });
      const checkUser = await UserModel.exists({ email: email });

      if (checkUser) {

        req.flash("error", "Email already have registered !");
        return res.redirect("/home/register");

      };

      //hash password before save
      const genSalt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, genSalt);

      const createNewUser = new UserModel({

        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashPassword

      });

      console.log('createNewUser - ', createNewUser);

      const saveNewUser = await createNewUser.save();

      if (!saveNewUser) {

        req.flash("error", "Something went wrong !");
        return res.redirect("/home/register");

      }

      res.redirect("/home/login");

    }




  } catch (error) {

    console.log(error.name, error.message);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      errorName: error.name,
      errorMsg: error.message
    });

  }
}

const _getRedirectUrl = (req, res) => {
  return req.user.role === "admin" ? "/home/admin/orders" : "/home/orders";
}


const login = async (req, res, next) => {
  try {

    //Authenticates requests.

    // Applies the nameed strategy(or strategies) to the incoming request, in order to authenticate the request.If authentication is successful, the user will be logged in and populated at req.user and a session will be established by default. If authentication fails, an unauthorized res
    //info is msg which are passed by using done cb in passportInit method

    passport.authenticate('local', (err, user, info) => {
      // console.log(user);
      // console.log(user._id);
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash('error', "All fields are required !");
        res.redirect("/home/login");
      }

      if (err) {
        req.flash("error", info.message);
        return next(err)
      };

      if (!user) {
        req.flash("error", info.message);
        return res.redirect("/home/login");
      }

      req.logIn(user, (err) => {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        req.flash('info', info.message)

        res.redirect(_getRedirectUrl(req));
      })

    })(req, res, next);
    // console.log('req.user - ', req.user);

  } catch (error) {

    console.log(error.name, error.message);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      errorName: error.name,
      errorMsg: error.message
    });

  }
}

const logoutController = async (req, res) => {
  try {
    // console.log("logout..")
    //Passport is a middleware that provides a strategy-based authentication framework for Node.js applications. Passport uses express-session middleware and has built-in methods for logging in and out users in routes.

    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/home");
    });

    /*
    
    const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const ejs = require('ejs');
const path = require('path');

const passport = require("passport");
const passportInit = require('./app/config/passport.js');

const expressLayouts = require('express-ejs-layouts');

const colors = require('colors');


const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST

const DATABASE_URL = process.env.DATABASE_URL;
const connectDB = require('./app/config/connectDB.js');

// Routes
const webRoutes = require('./routes/webRoutes.js');

const app = express();

// DB Connection
connectDB(DATABASE_URL);

// cookies
app.use(cookieParser());

// to store session in mongoDB
const sessionStore = MongoStore.create({
    mongoUrl: DATABASE_URL,
    dbName: "pizza",
    collectionName: "session",
    ttl: 2 * 24 * 60 * 60,
    autoRemove: "native"
})

// session middleware
app.use(session({
    name: "sessionName",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    store: sessionStore
}))

// flash
app.use(flash());

// password config
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());


// static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/home", express.static(path.join(__dirname, "public")));

// json
app.use(express.json());

// urlencoded
app.use(express.urlencoded({ extended: false }));

// global middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;

    next();
})

// set template engine
app.set('views', path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set('layout', 'layouts/main');


// Load Routes
app.use("/home", webRoutes);


app.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}...`.white.bgMagenta);
})

    */

  } catch (error) {

    console.log(error.name, error.message);
    res.status(500).send({
      success: false,
      message: "Error in logout",
      errorName: error.name,
      errorMsg: error.message
    });

  }
}


module.exports = { registerPage, loginPage, register, login, logoutController } 