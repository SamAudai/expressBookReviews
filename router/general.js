const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const bodyParser = require('body-parser');
const session = require('express-session')
const public_users = express.Router();

// Function to check if a user already exists
function doesExist(username) {
  // Iterate through the users array to check if the username already exists
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "Customer successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register Customer."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  //Write your code here
  return res.status(200).json({ books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  //Write your code here
  const ISBN = req.params.isbn;
  return res.status(200).json(books[ISBN]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  //Write your code here
  const AUTHOR = req.params.author;
  const booksByAuthor = [];
  // Iterate over each book in the books object
  for (const key in books) {
    if (books.hasOwnProperty(key)) {
      const book = books[key];
      if (book.author === AUTHOR) {        
        // Include the key in the book object
        book.isbn = key;
        // Exclude the 'author' property from the book object
        delete book.author;        
        booksByAuthor.push(book);
      }
    }
  }
  return res.status(200).json({"booksbyauthor":booksByAuthor});
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  const TITLE = req.params.title;
  const booksByTitle = [];
  // Iterate over each book in the books object
  for (const key in books) {
    if (books.hasOwnProperty(key)) {
      const book = books[key];
      if (book.title === TITLE) {        
        // Include the key in the book object
        book.isbn = key;
        // Exclude the 'author' property from the book object
        delete book.title;        
        booksByTitle.push(book);
      }
    }
  }
  return res.status(200).json({"booksbytitle":booksByTitle});
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const ISBN = req.params.isbn;

  // Check if the book with the given ISBN exists
  if (!books.hasOwnProperty(ISBN)) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Retrieve the book details including its reviews
  const book = books[ISBN];

  // Return the reviews of the book
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
