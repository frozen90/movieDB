
function displayMovies(movies) {


  const rows = movies.map(movie => {



    let row = `<div class="column d-flex align-items-stretch"><div class="card" style="width: 15rem;">
        <img class="card-img-top" src="${movie.link_to_poster}" alt="Card image cap">
        <div class="card-body" id="card_body">
          <h5 class="card-title">${movie.Title}</h5>
          <p class="card-text"><img id="like" src="https://image.flaticon.com/icons/png/512/25/25423.png"  height="24" width="24"><span id="likes">         ${movie.Likes}</span>  <img id="dislike" src="https://image.flaticon.com/icons/png/512/25/25395.png" width="24" height="24"><span><span></span>           ${movie.Dislikes}</span></p>
          <a href="#" onclick="updateMoviesView(${movie.movie_id})" class="btn btn-primary">More...</a>
          
       `

    if (userLoggedIn() === true) {
      row += `<br><button class="btn " data-toggle="modal" data-target="#MovieFormDialog" onclick="prepareMovieUpdate(${movie.movie_id})"><img height="24" width="24" src="https://image.flaticon.com/icons/png/512/126/126483.png"></button>
         <button class="btn" onclick="deleteMovie(${movie.movie_id})"><img height="24" width="24" src="https://image.flaticon.com/icons/png/512/1214/1214428.png"></button>`

    }
    row += ` </div>
       </div></div>`
    return row;

  });
  document.getElementById('movieCards').innerHTML = rows.join('');
}
function displaySingleMovie(singleMovie, castForMovie) {


  myHtmlStatement = `<div class="col-12">
  <h1>${singleMovie.Title}</h1>
</div>
<div class="col-12"><h10>${singleMovie.genre} | ${singleMovie.premiere_date}</h10></div>
<div class="col-1.5" style="margin-bottom: 2px;" >
  <img src="${singleMovie.link_to_poster}"  height="255px">
</div>
  <div class="col-9"><iframe width="100%" height="255" src="${singleMovie.link_to_embed_yt}" alt="" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>
  <div class="col-12"><p style="font-size:18px;">${singleMovie.Description}</p> </div>
  <div class="col-12"><b>Directors: </b>${singleMovie.Director_By}<br></div>
  <div class="col-12" style="border-top: solid;">
     <div id="cast">
         <b>CAST:</b>
      <table class="table table-striped table-bordered table-hover">
          <thead>
              <tr>
                  
                  
              </tr>
          </thead>
          <tbody id="castRows">
          
          </tbody>
      </table>
     </div>
  </div>`

  document.getElementById('movieCards').innerHTML = myHtmlStatement;
  const rows = castForMovie.map(actor => {

    let row = `<tr>
   <td><img src="${actor.Photo}" width="54" height="54"></td>
    <td>${actor.full_name}</td>
    <td>${actor.roleName}</td>
    </tr>`
    return row;
  });
  document.getElementById('castRows').innerHTML = rows.join('')

}

async function updateBySearchTerm() {


  // Get form fields
  const searchterm = document.getElementById('searchterm').value;
  const url = `${BASE_URL}/movie/title`
  // build request body
  const reqBody = JSON.stringify({
    title: searchterm

  });
  try {

    movies_by_term = await postOrPutDataAsync(url, reqBody, 'POST');

    movies = [];
    for (var i in movies_by_term) {
      movies.push([i, movies_by_term[i]]);

    }
    displayMovies(movies)
  } catch (err) {
    console.log(err);
  }

}


async function loadMovies() {
  try {

    const movies = await getDataAsync(`${BASE_URL}movie`);
    displayMovies(movies)

  } // catch and log any errors
  catch (err) {
    console.log(err);
  }
}


async function updateMoviesView(id) {
  try {
    let [castForMovie, singleMovie] = await Promise.all([getDataAsync(`${BASE_URL}actor/${id}`), getDataAsync(`${BASE_URL}movie/${id}`)]);

    displaySingleMovie(singleMovie, castForMovie);

  } // catch and log any errors
  catch (err) {
    console.log(err);
  }
}
async function prepareMovieUpdate(id) {

  try {
    // Get broduct by id
    const movie = await getDataAsync(`${BASE_URL}movie/${id}`);
    // Fill out the form
    document.getElementById('movie_id').value = movie.movie_id; // uses a hidden field - see the form
    document.getElementById('movie_title').value = movie.Title;
    document.getElementById('movie_description').value = movie.Description;
    document.getElementById('genre').value = movie.genre;
    document.getElementById('director').value = movie.Director_By;
    document.getElementById('link_to_poster').value = movie.link_to_poster;
    document.getElementById('link_to_embed_yt').value = movie.link_to_embed_yt;
    document.getElementById('likes').value = movie.Likes;
    document.getElementById('dislikes').value = movie.Dislikes;
  } // catch and log any errors
  catch (err) {
    console.log(err);
  }
}

async function addOrUpdateMovie() {

  // url
  let url = `${BASE_URL}movie`

  // Get form fields
  const mId = Number(document.getElementById('movie_id').value);
  const movTitle = document.getElementById('movie_title').value;
  const movDesc = document.getElementById('movie_description').value;
  const genre = document.getElementById('genre').value;
  const director = document.getElementById('director').value;
  const link_to_poster = document.getElementById('link_to_poster').value;
  const link_to_embed_yt = document.getElementById('link_to_embed_yt').value;
  const likes = document.getElementById('likes').value
  const dislikes = document.getElementById('dislikes').value

  // build request body
  const reqBody = JSON.stringify({
    movie_title: movTitle,
    movie_description: movDesc,
    genre,
    director,
    link_to_poster,
    link_to_embed_yt,

  });
  console.log(reqBody)
  // Try catch 
  try {
    let json = "";
    // determine if this is an insert (POST) or update (PUT)
    // update will include product id
    if (mId > 0) {
      url = `${BASE_URL}movie/${mId}`;
      json = await postOrPutDataAsync(url, reqBody, 'PUT');
      location.reload(true)
    }
    else {

      json = await postOrPutDataAsync(url, reqBody, 'POST');
      location.reload(true)
    }

    location.reload()
    loadMovies();
    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function deleteMovie(id) {

  if (confirm("Are you sure to delete movie ?")) {
    // url
    const url = `${BASE_URL}movie/${id}`;

    // Try catch 
    try {
      const json = await deleteDataAsync(url);
      console.log("response: " + json);

      loadMovies();

      // catch and log any errors
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}




async function showAddProductButton() {

  let addProductButton = document.getElementById('AddProductButton');
  try {


    if (userLoggedIn() === true && isAdmin() === true) {

      addProductButton.style.display = 'block';









    } else {
      addProductButton.style.display = 'none';
    }
  } catch (err) { }


}



showLoginLink();
loadMovies();
showAddProductButton();

