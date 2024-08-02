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
const getUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId]; // Return the user object if email matches
    }
  }
  return undefined; // Return null if no user found
};

const urlsForUser = (id, database) => {
  const userUrls = {};
  for (const urlId in database) {
    if (database[urlId].userID === id) {
      userUrls[urlId] = database[urlId];
    }
  }
  return userUrls;
};

module.exports = {
  urlsForUser,
  generateRandomString,
  getUserByEmail
};