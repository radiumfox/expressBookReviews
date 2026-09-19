const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  let userExists = users.find((user) => {
    return user.username === username;
  });

  if(username && password) {
    if(!userExists) {
      users.push({ username, password });

      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(400).json({message: "User already exists!"});
    }
  }

  return res.status(400).json({message: "Unable to register user, username or password is incorrect"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if(isbn) {
    const book = books[isbn];

    if(!book) {
      return res.status(404).send("Book is not found");
    } else {
      return res.send(JSON.stringify(book, null, 2));
    }
  }

  return res.status(400).send("No ISBN provided");
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  if(author) {
    const lowercaseAuthor = author.toLowerCase();
    const booksList = [];

    for(const book of Object.values(books)) {
      if(book.author.toLowerCase() === lowercaseAuthor) {
        booksList.push(book);
      }
    }

    if(!booksList.length) {
      return res.status(404).send("Books by this author not found");
    } else {
      return res.send(JSON.stringify(booksList, null, 2));
    }
  }

  return res.status(400).send("No author provided");
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  if(title) {
    const lowercaseTitle = title.toLowerCase();

    const book = Object.values(books).find(item => item.title.toLowerCase() === lowercaseTitle);

    if(!book) {
      return res.status(404).send("Book with this title not found");
    } else {
      return res.send(JSON.stringify(book, null, 2));
    }
  }

  return res.status(400).send("No title provided");
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if(isbn) {
    const book = books[isbn];

    if(!book) {
      return res.status(404).send("Book is not found");
    } else {
      return res.send(JSON.stringify(book.reviews, null, 2));
    }
  }

  return res.status(400).send("No ISBN provided");
});

module.exports.general = public_users;
