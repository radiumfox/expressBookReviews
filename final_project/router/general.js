const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject({ message: error.message });
    }
  });
};

const getBookByIsbn = (isbn) => {
  return new Promise((resolve, reject) => {
    try {
      if (isbn) {
        const book = books[isbn];

        if(!book) {
          reject({ message: "Book not found" });
        }

        resolve(book);
      }

      reject({ message: 'No ISBN provided' })
    } catch (error) {
      reject({ message: error.message });
    }
  });
}

const getBookByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    try {
      if (author) {
        const lowercaseAuthor = author.toLowerCase();
        const booksList = [];
        for(const book of Object.values(books)) {
          if(book.author.toLowerCase() === lowercaseAuthor) {
            booksList.push(book);
          }
        }

        if(!booksList.length) {
          reject({ message: "Books not found" });
        }

        resolve(booksList);
      }

      reject({ message: 'No author provided' })
    } catch (error) {
      reject({ message: error.message });
    }
  });
}

const getBookByTitle = (title) => {
  return new Promise((resolve, reject) => {
    try {
      if (title) {
        const lowercaseTitle = title.toLowerCase();

        const book = Object.values(books).find(item => item.title.toLowerCase() === lowercaseTitle);

        if(!book) {
          reject({ message: "Book not found" });
        }

        resolve(book);
      }

      reject({ message: 'No title provided' })
    } catch (error) {
      reject({ message: error.message });
    }
  });
}

const getReviewsByIsbn = (isbn) => {
  return new Promise((resolve, reject) => {
    try {
      if(isbn) {
        const book = books[isbn];

        if(!book) {
          reject({ message: "Book not found" });
        }

        resolve(book.reviews);
      }

      reject({ message: 'No ISBN provided' })
    } catch (error) {
      reject({ message: error.message });
    }
  })
}

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
      return res.status(409).json({ message: "User already exists!" });
    }
  }

  return res.status(400).json({ message: "Unable to register user, username or password is incorrect" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getAllBooks().then((books) => {
    res.status(200).json(books);
  }).catch((error) => {
    res.status(500).json({ message: error.message });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  getBookByIsbn(isbn).then((book) => {
    res.status(200).json(book);
  }).catch((error) => {
    res.status(500).json({ message: error.message });
  })
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  getBookByAuthor(author).then((book) => {
    res.status(200).json(book);
  }).catch((error) => {
    res.status(500).json({ message: error.message });
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  getBookByTitle(title).then((book) => {
    res.status(200).json(book);
  }).catch((error) => {
    res.status(500).json({ message: error.message });
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  getReviewsByIsbn(isbn).then((reviews) => {
    res.status(200).json(reviews);
  }).catch((error) => {
    res.status(500).json({ message: error.message });
  })
});

module.exports.general = public_users;
