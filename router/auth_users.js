let express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

//Function to check if the user exists
const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

//Function to check if the user is authenticated
const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: '1h'});

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("Customer successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.body;

  // Check if the user is authenticated
  if (!req.session.accessToken) {
    return res.status(401).json({ message: "Unauthorized. Please log in to add a review." });
  }

  // Check if the book exists in the database
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  // Add the review to the book
  if (!book.reviews) {
    book.reviews = [];
  }
  book.reviews.push(review);
  return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated`);
});

// Delete a book review
regd_users.delete("/auth/review/:isbn/:reviewId", (req, res) => {
  const { isbn, reviewId } = req.params;

  // Check if the user is authenticated
  if (req.session.accessToken) {
    return res.status(401).json({ message: "Unauthorized. Please log in to delete a review." });
  }

  // Check if the book exists in the database
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the review exists in the book's reviews array
  const reviewIndex = book.reviews.findIndex(review => review.id === reviewId);
  if (reviewIndex === -1) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Delete the review from the book's reviews array
  book.reviews.splice(reviewIndex, 1);

  return res.status(200).send(`Review for the ISBN ${isbn} posted by the user test deleted`);
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
