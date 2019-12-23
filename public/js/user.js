
function showLoginLink() {
  const link = document.getElementById('toLogin')

  // Read session storage value (set during login) and set link
  if (userLoggedIn() === true) {
    link.innerHTML = 'Logout';
    link.removeAttribute('data-toggle');
    link.removeAttribute('data-target');
    link.addEventListener("click", logout);
  }
  else {
    link.innerHTML = 'Login';
    link.setAttribute('data-toggle', 'modal');
    link.setAttribute('data-target', '#LoginDialog');
    //link.addEventListener('click', login);
  }

}

// Login a user
async function login() {

  // Login url
  const url = `${BASE_URL}login/auth`

  // Get form fields
  const user_name = document.getElementById('username').value;
  const pwd = document.getElementById('password').value;
  // build request body
  const reqBody = JSON.stringify({
    username: user_name,
    password: pwd
  });

  // Try catch 
  try {

    const json = await postOrPutDataAsync(url, reqBody, 'POST');
    console.log("response: " + json.user);

    // A successful login will return a user
    if (json.user != false) {
      // If a user then record in session storage

      sessionStorage.loggedIn = true;
      sessionStorage.userRole = json.user;
      // force reload of page
      console.log(json.user)
      location.reload(true);
    }

    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }

};
async function signup() {

  // Login url
  const url = `${BASE_URL}login`

  // Get form fields
  const user_name = document.getElementById('usernameToAdd').value;
  const pwd = document.getElementById('passwordToAdd').value;
  // build request body
  const reqBody = JSON.stringify({
    username: user_name,
    password: pwd
  });

  // Try catch 
  try {

    const json = await postOrPutDataAsync(url, reqBody, 'POST');
    console.log("response: " + json)





    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }

};

async function logout() {

  // logout url
  const url = `${BASE_URL}login/logout`
  // Try catch 
  try {

    // send request and via fetch
    const json = await getDataAsync(url);
    console.log("response: " + JSON.stringify(json));

    // forget user in session storage
    sessionStorage.loggedIn = false;

    // force reload of page
    location.reload(true);


    // reload 

    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }
};



function userLoggedIn() {

  if (sessionStorage.loggedIn == 'true') {
    return true;
  }
  else {
    return false;
  }
};

//checking user role for edit functions
function isAdmin() {
  if (sessionStorage.userRole == 'admin') {
    return true;
  } else {
    return false;
  }
}

