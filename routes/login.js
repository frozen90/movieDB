// import delcaration
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Delcaring packages to be used
const config = require('config');
const keys = config.get('keys');
const validator = require('validator');

// require the database connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

const SQL_INSERT = "INSERT INTO dbo.AppUser (username, password, Role) VALUES (@username, @password, 'User'); SELECT * from dbo.AppUser WHERE UserId = SCOPE_IDENTITY();"

const hashCost = 5;


// POST login.
// Send username and password via request body from a login form, etc.

router.post('/auth', (req, res) => {
  // use passport to athenticate - uses local middleware
  // session false as this API is stateless
  passport.authenticate(
    'local',
    { session: false }, (error, user, info) => {
      // authentication fails - return error
      if (error || !user) {
        return res.status(400).json({
          message: info ? info.message : 'Login failed',
          user: user
        });
      }

      
      const payload = {
        username: user.username,
        role: user.Role,
        
        expires: Date.now() + (1000 * 60 * 30),
      };

      //assigns payload to req.user
      req.login(payload, { session: false }, (error) => {
        if (error) {
          return res.status(400).send({ error });
        }
        // generate a signed json web token and return it in the response
        const token = jwt.sign(JSON.stringify(payload), keys.secret);

        // add the jwt to the cookie and send
        res.cookie('jwt', token, { httpOnly: true, secure: false })
        //sending user role to check if user can edit movie list
        res.status(200).send({ "user": user.Role, token });
      });
    },
  )(req, res);
});


//logout
router.get('/logout', async (req, res) => {


  try {


    // add the jwt to the cookie and send
    res.clearCookie('jwt', {path: '/'});
    return res.status(200).send({"message": "Logged out"});

    // Catch and send errors  
  } catch (err) {
    res.status(500)
    res.send(err.message)
  }
});

router.post('/', async (req,res) => {
  let errors = "";

  const username = req.body.username;
  if (!validator.isAlpha(username, ['en-GB'])) {
    errors += "invalid username"
  }
  let password = req.body.password;
 
  if (!validator.matches(password, /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i")) {
    errors += "invalid password ";
  }


  if (errors != ""){
    res.json({"error": errors});
    return false;
  }

  try {
   

    const pool = await dbConnPoolPromise
    const result = await pool.request()
      
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
    

      .query(SQL_INSERT);
      
    res.json(result.recordset[0])
  }catch(err){
    res.status(500)
    res.send(err.message)
  }

})




module.exports = router;
