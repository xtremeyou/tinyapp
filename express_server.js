const express = require('express');
const app = express();
const PORT = 8080;

const urlDatatbase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/urls.json', (req, res) => {
  res.json(urlDatatbase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Herro <b>World</b></body></html>\n');
});

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});