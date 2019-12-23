const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const hbs = require('hbs')
const cookieParser = require('cookie-parser')
const passport = require('passport');
require('./security/passportConfig')

//app entry point
const app = express()
const PORT = 3000;
app.use(passport.initialize());
app.use(passport.session());

// Setup for serving static assets
app.use(express.static('public'))

app.use((req, res, next) => {
    // Globally set Content-Type header for the application
    res.setHeader("Content-Type", "application/json");
  
    next();
}); 

app.use(cookieParser());


app.use(bodyParser.text());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support url encoded bodies
//cors
app.use(cors({ credentials: true, origin: true }));
app.options('*', cors()) 

/* DEFINED ROUTES */

//default home page
app.use('/', require('./routes/index'));

//endpoint for movies list
app.use('/movie', require('./routes/movies'));

//endpoint for actors
app.use('/actor', require('./routes/actors'));

//endpoint for login
app.use('/login', require('./routes/login'));

//endpoint for users
app.use('/user',passport.authenticate('jwt', { session : false }), require('./routes/user') );




//handling 404 error -> undefined endpoint
app.use(function (req, res, next) {
    var err = new Error('Not Found: '+ req.method + ":" + req.originalUrl);
    err.status = 404;
    next(err);
});





//run the server
app.listen(PORT,  function() {
    console.log(`Express server listening PORT :${PORT}`);
});

module.exports = app;

