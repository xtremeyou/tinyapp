/* eslint-disable camelcase */
const express = require('express');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.use(cookieParser());

app.use(express.urlencoded({ extended: true })); //allow us to read req.params.body in human readable form

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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

//checks if existing emails, or other data exist inside user database
const getUserInfo = function(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId]; // Return the user object if email matches
    }
  }
  return null;
};

const urlsForUser = (id) => {
  const userUrls = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      userUrls[urlId] = urlDatabase[urlId];
    }
  }
  return userUrls;
};

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


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); //sends urlDatabase to path /urls.json in json form
});

//lets us use our template vars in our views
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send('You need to log in to view your URLs.');
  }
  
  const userUrls = urlsForUser(userId);
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
  const result = getUserInfo(userEmail); // asssigns users object userid key to result
  //also callsback to funciton using userEmail as a parameter
  if (result) { //if there is duplciate emails, error
    res.status(400).send("Email already registered, please use another email.");
  }
  console.log(`ID: ${randomUserID}`);
  console.log(`Email: ${userEmail}`);
  console.log(`Hashed Password: ${hashedPassword}`);
  //creates new userid, then assigsn it to cookies value, to be used across website
  users[randomUserID] = { id: randomUserID, email: userEmail, password: hashedPassword };
  req.session.user_id = randomUserID;
  res.redirect('/urls');
});

 



app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,//allows us to use URLdatabase key/value pairs inside our view files
    user: users[req.session.user_id] //has users current login info stored here, to be used across website
  };
  if (templateVars.user) {
    return res.redirect('/urls');
  }
  res.render('register', templateVars); //renders register and allows use of templateVar inside /register
});

//posts data from longURl to the database with a generated shortURl
//console.logs both longURl and shortURl
//redirects shortURl to urls_show view
app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send('<h1>You need to login first to shorten URLs</h1>');
  }
  
  const longURL = req.body.longURL;
  const shortURLID = generateRandomString();
  urlDatabase[shortURLID] = {
    longURL,
    userID: userId
  };
  res.redirect('/urls');
});

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

app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase, //allows us to use URLdatabase key/value pairs inside our view files
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.redirect('/urls');
  }
  res.render('login', templateVars);
});


app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    return res.status(403).send('Please enter both an email and password');
  }
  const user = getUserInfo(userEmail);//assign the user object to user variable with param userEmail
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
  res.redirect('/login'); //redirects url to /urls
});


app.get('/u/:id', (req, res) => {
  const id = req.params.id; //assigns id to websites path /urls/id
  const longURL = urlDatabase[id]; //assigns longurl variable to urlDatabases id, which is the value of URLDatabases key/value pairs
  if (!longURL) {
    // Render the `urls_show` view with an error message if the URL is not found
    return res.status(404).render('urls_show', { message: 'Short URL not found in the database' });
  }

  res.redirect(longURL.longURL); //if urlDatabase has a longURL value attached to the key which is id, it'll redirect webpage to a new site
});

//outputs long url id, and shortURl id on path /urls/:id
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const urlData = urlDatabase[id];

  if (!urlData) {
    return res.status(404).render('urls_show', { message: 'Short URL not found in the database' });
  }

  console.log("URL Data:", urlData); // Debugging
  console.log("Long URL:", urlData.longURL); // Debugging


  const templateVars = {
    id: id,
    longURL: urlData.longURL,
    urls: urlDatabase,
    user: users[req.session.user_id],
    message: null
  };
  
  res.render('urls_show', templateVars); // Pass URL details if URL exists
});

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

//says hello when at endpointa
app.get('/', (req, res) => {
  res.send('Hello'); //sends "Hello" to / endpoint path
});
//allows server to listen for events
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});