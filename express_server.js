const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

//create function to generate random string
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  while (randomString.length < 6) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }

  return randomString;
};
app.use(express.urlencoded({ extended: true })); //allow us to read req.params.body in human readable form

//creates a database to use our templates
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); //sends urlDatabase to path /urls.json in json form
});

//lets us use our template vars in our views
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }; //allows us to use URLdatabase key/value pairs inside our urls_index view file
  res.render('urls_index', templateVars); //renders the page, and allows use of templateVars
});

//posts data from longURl to the database with a generated shortURl
//console.logs both longURl and shortURl
//redirects shortURl to urls_show view
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL; //assigns variable longURl to req.body.longURl, which allows variable longURl to have longURl's body data
  const shortURLID = generateRandomString(); //assigns variable shortURLID a random string of 6 characters
  urlDatabase[shortURLID] = longURL; // shortURlID now replaces urlDatabases key, and a longURl to it as a value?
  res.redirect('/urls'); //redirects to the urls list page, where it contains a list of all urls in the database
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id; //assigns id to id of the route path
  const newLongURL = req.body.longURL; //assign newLongURL the data of the longURL data from the form submitted 
  try {
    if (!urlDatabase[id]) { //checks if urlDatabase has no keys, if so it will throw error
      throw new Error("You need to update an already exisiting url");
    }
    urlDatabase[id] = newLongURL;//assigns key of urlDatabase a newlongURL value
    res.redirect('/urls'); //redirects to path /urls which is the page that lists our created urls
  } catch (error) {
    console.log(error);//will catch error if error happens, display an error output to console
    res.status(404).render('error', {message: error.message}); //will render error page if error
  }
  
  
});

//connects the view file to our server as well as adding a path to it
app.get('/urls/new', (req, res) => {
  res.render('urls_new'); //renders a new view "urls_new"
});


app.get('/u/:id', (req, res) => {
  const id = req.params.id; //assigns id to websites path /urls/id
  const longURL = urlDatabase[id]; //assigns longurl variable to urlDatabases id, which is the value of URLDatabases key/value pairs
  res.redirect(longURL); //if urlDatabase has a longURL value attached to the key which is id, it'll redirect webpage to a new site
});

//outputs long url id, and shortURl id on path /urls/:id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id; //assigns id to webites path /urls/:id
  const longURL = urlDatabase[id]; //assigns longURl to urlDatabases key, it'll now hold the long version of an url
  const templateVars = { id: req.params.id, longURL: longURL }; //allows us to use the id and longURL variables inside our views using js
  res.render('urls_show', templateVars); //it'll now render the views template, allowing us to access it, as well as given us access to the objects key/value pairs data
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id; //assigns id to website path /urls/:id/delete
  delete urlDatabase[id]; //using the delete method, it'll delete the key/value pairs inside urlDatabase
  res.redirect('/urls'); //it'll redirect us to path /urls after we delete everything
});


//says hello when at endpoint
app.get('/', (req, res) => {
  res.send('Hello'); //sends "Hello" to / endpoint path
});

//allows server to listen for events
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});