// JavaScript Fetch, see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// The set HTTP headers. These will be used by Fetch when making requests to the api
const HTTP_REQ_HEADERS = new Headers({
  "Accept": "application/json",
  "Content-Type": "application/json"
});



const GET_INIT = { method: 'GET', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors', cache: 'default' };
const DELETE_INIT = { method: 'DELETE', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors' };
const BASE_URL = `http://localhost:3000/`;


// Asynchronous Function getDataAsync from a url and return
async function getDataAsync(url) {
  // Try catch 
  try {
    
    const response = await fetch(url, GET_INIT);
    const json = await response.json();

    return json;

    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }

}


// Asynchronous Function to POST or PUT data to a url
async function postOrPutDataAsync(url, reqBody, reqMethod) {

  // create request object
  const request = {
    method: reqMethod,
    headers: HTTP_REQ_HEADERS,
    credentials: 'include', // important
    mode: 'cors',
    body: reqBody
  };

  // Try catch 
  try {

    const response = await fetch(url, request);
    const json = await response.json();
   
    console.log(json)
   
    return json;
    // catch and log any errors
  } catch (err) {
    console.log(err);
    console.log(request)
    console.log(json)
    return err;
  }

}

// Delete
async function deleteDataAsync(url) {

  try {

    const response = await fetch(url, DELETE_INIT);
    const json = await response.json();

    console.log(json);
    return json;

  } catch (err) {
    console.log(err);
    return err;
  }
}