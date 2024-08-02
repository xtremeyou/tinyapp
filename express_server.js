/* eslint-disable camelcase */
const express = require('express');
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true })); //allow us to read req.params.body in human readable form

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set('view engine', 'ejs');


//user database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

//creates a database to use our templates
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

app.get('/', (req, res) => {

  res.redirect('/login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); //sends urlDatabase to path /urls.json in json form
});

//lets us use our template vars in our views
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send('You need to log in to view URLs.');
  }
  //variable userUrls assigns the helper function with two variables
  const userUrls = urlsForUser(userId, urlDatabase); //stores the users id and database for use in our views
  const templateVars = {
    urls: urlDatabase,
    url: userUrls,
    user: users[userId]
  };
  res.render('urls_index', templateVars);
});



app.post('/register', (req, res) => { //posts form info to this method
  const randomUserID = generateRandomString(); //generates random user id
  const userEmail = req.body.email; //gets body info from form inside register view
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10); //same as above, but for password
  if (!userEmail || !userPassword) {  //if no email/password is entered, error!
    res.status(400).send('Please enter both email and password!');
  }
  const existingUser = getUserByEmail(userEmail, users); // asssigns users object userid key to result
  //also callsback to funciton using userEmail as a parameter
  if (existingUser) { //if there is duplciate emails, error
    res.status(400).send("Email already registered, please use another email.");
  }
 
  //creates new userid, then assigsn it to cookies value, to be used across website
  users[randomUserID] = { id: randomUserID, email: userEmail, password: hashedPassword };
  req.session.user_id = randomUserID;
  res.redirect('/urls');
});


app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id] //has users current login info stored here, to be used across website
  };
  if (templateVars.user) {
    return res.redirect('/urls');
  }
  res.render('register', templateVars); //renders register and allows use of templateVar inside /register
});

// the magic for how a user logs in ;)
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    return res.status(403).send('Please enter both an email and password');
  }

  const user = getUserByEmail(userEmail, users);//assign the user object to user variable with param userEmail
  if (!user) {
    return res.status(403).send('No user found associated with that email');
  }

  const isPasswordCorrect = bcrypt.compareSync(userPassword, user.password);
  if (!isPasswordCorrect) {
    return res.status(403).send('Incorrect password');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login'); //redirects url to /urls when logging out
});

//posts data from longURl to the database with a generated shortURl
app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send('<h1>You need to login first to shorten URLs</h1>');
  }

  //allows the webpage to store long urls
  const longURL = req.body.longURL;
  const shortURLID = generateRandomString();
  urlDatabase[shortURLID] = {
    urls: urlDatabase,
    longURL,
    userID: userId
  };
  res.redirect('/urls');
});

//blocks access for using specific parts of the site if not logged in, and displays error message.
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(403).send('You need to be logged in to edit this URL.');
  }

  if (!urlDatabase[id]) {
    return res.status(404).send('URL not found.');
  }

  if (urlDatabase[id].userID !== userId) {
    return res.status(403).send('You do not have permission to edit this URL.');
  }

  urlDatabase[id].longURL = newLongURL;
  res.redirect('/urls');
});

//connects the view file to our server as well as adding a path to it
app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,//allows us to use URLdatabase key/value pairs inside our urls_index view file
    user: user
  };
  res.render('urls_new', templateVars); //renders a new view "urls_new"
});

//lets a user to login, if already logged in it will redirect them to the main page
app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.redirect('/urls');
  }
  res.render('login', templateVars);
});


//outputs long url id, and shortURl id on path /urls/:id
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const urlData = urlDatabase[id];

  if (!urlData) {
    return res.status(404).send('Short URL not found in the database');
  }

  const templateVars = {
    id,
    urls: urlDatabase,
    longURL: urlData.longURL,
    user: users[req.session.user_id],
    message: null
  };

  res.render('urls_show', templateVars); // Pass URL details if URL exists
});

//allows user to delete database urls that are stored
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(403).send('You need to be logged in to delete URLs.');
  }

  if (!urlDatabase[id]) {
    return res.status(404).send('URL not found.');
  }

  if (urlDatabase[id].userID !== userId) {
    return res.status(403).send('You do not have permission to delete this URL.');
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const id = req.params.id; //assigns id to websites path /urls/id
  const longURL = urlDatabase[id]; //assigns longurl variable to urlDatabases id, which is the value of URLDatabases key/value pairs
  if (!longURL) {
    // Render the `urls_show` view with an error message if the URL is not found
    return res.status(404).send('Short URL not found in the database');
  }

  res.redirect(longURL.longURL); //if urlDatabase has a longURL value attached to the key which is id, it'll redirect webpage to a new site
});

//allows server to listen for events
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});