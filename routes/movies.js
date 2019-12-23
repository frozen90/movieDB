// Import router package

const router = require('express').Router();
const cors = require('cors')
const express = require('express')
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validator = require('validator')
router.use(passport.initialize());
router.use(cors({ credentials: true, origin: true }));
router.options('*', cors()) 

const { sql, dbConnPoolPromise } = require('../database/db.js');
// Define SQL statements here for use in function below
// These are parameterised queries note @named parameters.
// Input parameters are parsed and set before queries are executed
// for json path - Tell MS SQL to return results as JSON 
const SQL_SELECT_ALL = 'SELECT * FROM dbo.Movie ORDER BY Title ASC for json path;';

// for json path, without_array_wrapper - use for single json result
const SQL_SELECT_BY_ID = 'SELECT * FROM dbo.Movie WHERE movie_id = @id for json path, without_array_wrapper;';
const SQL_GET_CAST = 'select Actor.full_name,actor_movie.roleName from dbo.Actor,dbo.actor_movie where actor_movie.movie_id = @id AND dbo.Actor.ActorID = dbo.actor_movie.actor_id ';

// for json path, without_array_wrapper - use for single json result


// Second statement (Select...) returns inserted record identified by ProductId = SCOPE_IDENTITY()
const SQL_INSERT = 'INSERT INTO dbo.Movie ( Title, Description, Likes, Dislikes,  genre, Director_By, link_to_poster, link_to_embed_yt) VALUES ( @movie_title, @movie_description, 0,0,@movie_genre,@director,@link_to_poster, @link_to_embed_yt); SELECT * from dbo.Movie WHERE movie_id = SCOPE_IDENTITY();';
const SQL_UPDATE = 'UPDATE dbo.Movie SET Title = @movie_title, Description = @movie_description, Likes = 0, Dislikes = 0, genre = @movie_genre, Director_by = @director, link_to_poster = @link_to_poster WHERE movie_id = @movie_id; SELECT * FROM dbo.Movie WHERE movie_id = @movie_id;';
const SQL_DELETE = 'DELETE FROM dbo.Movie WHERE movie_id = @movie_id;';
const app = express()
app.use(express.static('public'))
/* Hand get requests for '/'
/* this is the index or home page
*/
router.get('/', async (req, res) => {

    try {
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // execute query
            .query(SQL_SELECT_ALL);
        
        // Send HTTP response.
        // JSON data from MS SQL is contained in first element of the recordset.
        return res.json(result.recordset[0]);
      // Catch and send errors  
      } catch (err) {
        res.status(500)
        res.send(err.message)
      }
});
// tried to define search ...
// router.post('/title',async(req,res) => {
//     let title = req.body.title
//     try {
//         // Get a DB connection and execute SQL
//         const SQL_GET_MOVIE_BY_SEARCHTERM = "SELECT * FROM [dbo].[Movie] WHERE [dbo].[Movie].Title LIKE '%"+ title +"%';"
        
//         const pool = await dbConnPoolPromise
//         const result = await pool.request()
            
//             // execute query
//             .query(SQL_GET_MOVIE_BY_SEARCHTERM);
            

//         // Send response with JSON result    
        
//          return res.json(result.recordset[0])

//         } catch (err) {
//             res.status(500)
//             res.send(err.message)
//         }
    
// })
router.get('/:id', async (req, res) => {

    // read value of id parameter from the request url
    const movie_id = req.params.id;

    // Validate input - important as a bad input could crash the server or lead to an attack
    // See link to validator npm package (at top) for doc.
    // If validation fails return an error message
    if (!validator.isNumeric(movie_id, { no_symbols: true })) {
        res.json( {error:"Invalid id parrameter"});
        return false;
    }

    // If validation passed execute query and return results
    // returns a single product with matching id
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set name parameter(s) in query
            .input('id', sql.Int, movie_id)
            // execute query
            .query(SQL_SELECT_BY_ID);
            

        // Send response with JSON result    
        return res.json(result.recordset[0])

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
});


router.post('/', passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        let errors = "";
        const movie_title = req.body.movie_title
        if (movie_title === "") {
            errors += "Invalid Movie Title"
        }
        const movie_description = req.body.movie_description
        if (movie_description === "") {
            errors += "Invalid movie description"
        }
        const genre = req.body.genre
        if (genre === "") {
            errors += "Please provide genre"
        }
        const director = req.body.director
        if (director === "") {
            errors += "Please provide director"
        }
        const link_to_poster = req.body.link_to_poster
        if (link_to_poster === "") {
            errors += "Please provide link to poster"
        }
        const link_to_embed_yt = req.body.link_to_embed_yt
        if (link_to_poster === "") {
            errors += "Please provide ember link to trailer"
        }
        
        

        if (errors != "") {
            res.json({ "error": errors })
            return false
        }


        try {
            const pool = await dbConnPoolPromise
            const result = await pool.request()

                .input('movie_title', sql.NVarChar, movie_title)
                .input('movie_description', sql.NVarChar, movie_description)
                .input('movie_genre', sql.NVarChar, genre)
                .input('director', sql.NVarChar, director)
                .input('link_to_poster', sql.NVarChar, link_to_poster)
                .input('link_to_embed_yt',sql.NVarChar,link_to_embed_yt)
               

                

                .query(SQL_INSERT)
            
            res.json(result.recordset[0]);

            }catch (err){
                res.status(500)
                res.send(err.message)

            }
            
            
            
            });

            
       
router.put('/:id', passport.authenticate('jwt',{ sesssion: false }),
async (req,res) =>{
    
        let errors = "";
        const movieID = req.params.id;
        const movie_title = req.body.movie_title
        if (!validator.isNumeric(movieID, {no_symbols: true})) {
            errors+= "invalid movie id; ";
        }
        if (movie_title === "") {
            errors += "Invalid Movie Title"
        }
        const movie_description = req.body.movie_description
        if (movie_description === "") {
            errors += "Invalid movie description"
        }
        const genre = req.body.genre
        if (genre === "") {
            errors += "Please provide genre"
        }
        const director = req.body.director
        if (director === "") {
            errors += "Please provide director"
        }
        const link_to_poster = req.body.link_to_poster
        if (link_to_poster === "") {
            errors += "Please provide link to poster"
        }
        const likes = req.body.likes
        const dislikes = req.body.dislikes
        

        if (errors != "") {
            res.json({ "error": errors })
            return false
        }
        try {
            const pool = await dbConnPoolPromise
            const result = await pool.request()
                .input('movie_id', sql.Int, movieID)
                .input('movie_title', sql.NVarChar, movie_title)
                .input('movie_description', sql.NVarChar, movie_description)
                .input('movie_genre', sql.NVarChar, genre)
                .input('director', sql.NVarChar, director)
                .input('link_to_poster', sql.NVarChar, link_to_poster)
                .input('likes',sql.Int,likes)
                .input('dislikes',sql.Int,dislikes)

                

                .query(SQL_UPDATE)
            
            res.json(result.recordset[0]);

            }catch (err){
                res.status(500)
                res.send(err.message)

            }


})

router.delete('/:id', passport.authenticate('jwt', { session: false}),
async (req, res) => {

    // Validate
    const movieID = req.params.id;

    // If validation fails return an error message
    if (!validator.isNumeric(movieID, { no_symbols: true })) {
        res.json({ "error": "invalid movie id parameter" });
        return false;
    }
    
    // If no errors try delete
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            .input('movie_id', sql.Int, movieID)
            .query(SQL_DELETE);      
    

        const rowsAffected = Number(result.rowsAffected);

        let response = {"deletedId": null}

        if (rowsAffected > 0)
        {
            response = {"deletedId": productId}
        }

        res.json(response);

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
});



// export
module.exports = router;