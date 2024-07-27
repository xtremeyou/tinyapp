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
app.use(express.urlencoded({ extended: true }));

//creates a database to use our templates
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

//sends a json respones containing the data of the urldatabase object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//lets us use our template vars in our views
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//posts data from longURl to the database with a generated shortURl
//console.logs both longURl and shortURl
//redirects shortURl to urls_show view
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURLID = generateRandomString();
  urlDatabase[shortURLID] = longURL;
  console.log(`longURL: ${longURL}`);
  console.log(`short URL ID: ${shortURLID}`);
  res.redirect('/urls/', shortURLID);
});

//connects the view file to our server as well as adding a path to it
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//redirects shortURL to longUrl in database, so for example b2xVn2 redirects to lighthouselab.com
app.get('/u/:id', (req, res) => {
  const shortURLID = req.params.id;
  const longURL = urlDatabase[shortURLID];
  res.redirect(longURL);
});

//when using the small data links inside urldatabse it'll output the larger one on screen
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: req.params.id, longURL: longURL };
  res.render('urls_show', templateVars);
});

//just sends a response/message to the path /url, which says herro world
app.get('/hello', (req, res) => {
  res.send('<html><body>Herro <b>World</b></body></html>\n');
});

//says hello when at endpoint
app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});