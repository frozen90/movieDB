const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const config = require('config');
const keys = config.get('keys');

const validator = require('validator');

const { sql, dbConnPoolPromise } = require('../database/db.js');
const SQL_SELECT_ALL = 'SELECT * FROM dbo.AppUser for json path;';
const SQL_SELECT_BY_ID = 'SELECT * FROM dbo.AppUser WHERE UserId = @id for json path, without_array_wrapper;';

// GET listing of all users
router.get('/', passport.authenticate('jwt', { session: false}),
async (req, res) => {
  // Get a DB connection and execute SQL
  try {
    const pool = await dbConnPoolPromise
    const result = await pool.request()
      // execute query
      .query(SQL_SELECT_ALL);

    
    return res.json(result.recordset);

    // Catch and send errors  
  } catch (err) {
    res.status(500)
    res.send(err.message)
  }
});


router.get('/:id', passport.authenticate('jwt', { session: false}),
async (req, res) => {
  //param of user id
  const userId = req.params.id;

  if (!validator.isNumeric(userId, { no_symbols: true })) {
    res.json({ "error": "invalid id parameter" });
    return false;
  }

  
  try {
    // Get a DB connection and execute SQL
    const pool = await dbConnPoolPromise
    const result = await pool.request()
      // set name parameter(s) in query
      .input('id', sql.Int, userId)
      // execute query
      .query(SQL_SELECT_BY_ID);

    // Send response with JSON result    
      return res.json(result.recordset[0])

  } catch (err) {
    res.status(500)
    res.send(err.message)
  }
});




module.exports = router;
