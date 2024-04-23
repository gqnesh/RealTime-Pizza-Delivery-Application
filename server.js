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
const cors = require('cors');

const passport = require("passport");
const passportInit = require('./app/config/passport.js');

const expressLayouts = require('express-ejs-layouts');
const Emitter = require('events');

const colors = require('colors');


const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST

const DATABASE_URL = process.env.DATABASE_URL;
const connectDB = require('./app/config/connectDB.js');

// Routes
const webRoutes = require('./routes/webRoutes.js');
const googleLogin = require('./routes/googleStrategy.js');

const app = express();

// CORS
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
// app.use(cors(corsOptions));
app.use(cors());

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
});

// event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter)


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
app.use("/home", googleLogin);

// 404
app.use("*", (req, res) => {
    res.status(404).render('    errors/404')
})


// socket.io
const server = app.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}...`.white.bgMagenta);
});

const io = require('socket.io')(server);

io.on("connection", (socket) => {
    //Join
    // console.log(socket.id);
    //whichever connection comes will get asssigned to private romms of specified orders
    // so, when order._id get passed then it will assign to the roomName parameter
    // we are creating room for particular order
    socket.on("join", (roomName) => {
        console.log("room created - ", roomName);
        socket.join(roomName);
    })
})

//The EventEmitter class in Node.js is used to create an observer pattern. It is a class that provides a mechanism for creating and listening to events.
// The on() method is used to register a listener for an event.The listener is a callback function that will be called when the event is emitted.The to() method is used to register a listener for an event once.The listener will be called only the first time the event is emitted.

// socket.to() creates a property on the socket named _rooms that is an array of room names
// to io.to method is used to passed data in _rooms which is created during connection
eventEmitter.on("orderUpdated", (data) => {
    io.to(`order_${data.id}`).emit("orderUpdated", data)
    // console.log('orderupadted - ',data)

})

eventEmitter.on("orderPlaced", (data) => {
    // console.log('admin-1');
    io.to("adminRoom").emit("orderPlaced", data)
})