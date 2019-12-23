// Import router package
const router = require('express').Router();
const express = require('express')
let validator = require('validator')

const { sql, dbConnPoolPromise } = require('../database/db.js');




const SQL_GET_CAST = 'select Actor.full_name,actor_movie.roleName,actor.Photo from dbo.Actor,dbo.actor_movie where actor_movie.movie_id = @id AND dbo.Actor.ActorID = dbo.actor_movie.actor_id ';
/* Hand get requests for '/'
/* this is the index or home page
*/
router.get('/:id', async (req, res) => {

    // read value of id parameter from the request url
    const movie_id = req.params.id;
    if (!validator.isNumeric(movie_id, { no_symbols: true })) {
        res.json({ "error": "invalid id parameter" });
        return false;
    }


    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set name parameter(s) in query
            .input('id', sql.Int, movie_id)
            // execute query
            .query(SQL_GET_CAST);
            

        // Send response with JSON result    
        res.json(result.recordset)

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
});

// export
module.exports = router;