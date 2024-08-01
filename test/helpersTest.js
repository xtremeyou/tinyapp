const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};


describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, testUsers[expectedUserID]);
  });
  it('should return a user with valid email', function () {
    const user = getUserByEmail("randomEmail@email.com", testUsers);
    assert.equal(user, undefined);
  });
});

describe('generateRandomString', function () {
  it('Should return a tring with a length of 6', function () {
    const randomString = generateRandomString();
    assert.lengthOf(randomString, 6);
  });
  it('should return a string containing only alphanumeric characters', function () {
    const randomString = generateRandomString();
    const validChars = /^[A-Za-z0-9]+$/;
    assert.match(randomString, validChars);
  });
});

describe('urlForUser', function () {
  it('should return URLs associated with the given user ID', function () {
    const userUrls = urlsForUser('userRandomID', testUrlDatabase);
    const expectedUrls = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID",
      },
    };
    assert.deepEqual(userUrls, expectedUrls);
  });
  it('should return an empty object for a user with no URLs', function () {
    const userUrls = urlsForUser('nonExistentUserID', testUrlDatabase);
    assert.deepEqual(userUrls, {});
  });
});