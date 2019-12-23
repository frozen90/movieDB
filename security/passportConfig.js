// Imports for dependencies
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const ExtractJwt = require('passport-jwt').ExtractJwt
const JWTStrategy = passportJWT.Strategy
const bcrypt = require('bcryptjs')

const { sql, dbConnPoolPromise } = require('../database/db.js')

const config = require('config')

const keys = config.get('keys')
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });


const getUser = async (username) => {

    try {
        console.log(username)
        const SQL_GET_USER_BY_USERNAME = 'Select * from dbo.AppUser Where username = @username for json path, without_array_wrapper;'
        const pool = await dbConnPoolPromise
        const result = await pool.request()

            .input('username', sql.NVarChar, username)
            .query(SQL_GET_USER_BY_USERNAME);

        return (result.recordset[0]);

    } catch (err) {
        res.status(500)
        res.send(err.message)
    }

}


passport.use(new LocalStrategy({

    usernameField: 'username',
    passwordField: 'password',
}, async (username, password, done) => {
    try {
        const user = await getUser(username)
        console.log(user)
        if (user != null){
            
            
            if (user.password === password) {
                
                
                return done(null, user,  { message: 'Logged in sucessfully' })
            } }else {
                return done(null, false, { message: 'Incorrect Username / Password' })
            }
    } catch (error) {
        return done(error);
    }
}));

passport.use(new JWTStrategy({
    //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: keys.secret
},
    (jwtPayload, done) => {
        console.log(`jwt: ${jwtPayload.username}`);
        if (parseInt(Date.now()) > parseInt(jwtPayload.expires)) {
            return done('jwt expired');
        }
        return done(null, jwtPayload)
    }
))