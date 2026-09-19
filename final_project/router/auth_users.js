const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
 return username && username.length > 1;
};

const authenticatedUser = (username,password)=> {
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  return validUsers.length > 0;
}

//only registered users can login
regd_users.post('/login', (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username or password is missing' });
  }

  if(authenticatedUser(username, password)){
    let accessToken = jwt.sign({
      username: username
    }, 'access', {expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }

    return res.status(200).json({ message: 'User successfully logged in' });
  } else {
    return res.status(401).json({ message: 'Invalid Login. Check username and password' });
  }
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if(!isbn){
    return res.status(400).json({ message: 'No ISBN provided' });
  }

  const book = books[isbn];

  if(!book) {
    return res.status(404).json({ message: 'No book found with this ISBN' });
  }

  const review = req.body.review;

  if(!review){
    return res.status(400).json({ message: 'No review provided' });
  }

  const username = req.user.username;

  book.reviews[username] = review;

  return res.status(200).json({ message: 'Successfully added review' });
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if(!isbn){
    return res.status(400).json({ message: 'No ISBN provided' });
  }

  const book = books[isbn];

  if(!book) {
    return res.status(404).json({ message: 'No book found with this ISBN' });
  }

  const username = req.user.username;

  delete book.reviews[username];

  return res.status(200).json({ message: 'Successfully deleted review' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
