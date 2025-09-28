const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// --------------------
// Helper functions
// --------------------
const doesExist = (username) => {
    return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some((user) => user.username === username && user.password === password);
};

// --------------------
// Register endpoint
// --------------------
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    if (doesExist(username)) {
        return res.status(409).json({message: "User already exists!"});
    }

    users.push({ username, password });
    return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// --------------------
// Get the book list (async/await with Axios)
// --------------------
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get("http://localhost:5000/booksdata");
        res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error fetching books list", error: error.message });
    }
});

// Helper endpoint for Axios calls
public_users.get('/booksdata', (req, res) => {
    res.json(books);
});

// --------------------
// Get book details based on ISBN
// --------------------
public_users.get('/isbn/:isbn',function (req, res) {
    const ISBN = req.params.isbn;
    res.send(books[ISBN]);
});

// --------------------
// Get book details based on Author (async/await with Axios)
// --------------------
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();

    try {
        const response = await axios.get("http://localhost:5000/booksdata");
        const allBooks = response.data;
        const matchingBooks = [];

        Object.keys(allBooks).forEach((key) => {
            if (allBooks[key].author.toLowerCase().includes(author)) {
                matchingBooks.push(allBooks[key]);
            }
        });

        if (matchingBooks.length > 0) {
            res.send(matchingBooks);
        } else {
            res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

/*
// Alternative: Promise callback style
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();

    axios.get("http://localhost:5000/booksdata")
        .then(response => {
            const allBooks = response.data;
            const matchingBooks = [];

            Object.keys(allBooks).forEach((key) => {
                if (allBooks[key].author.toLowerCase().includes(author)) {
                    matchingBooks.push(allBooks[key]);
                }
            });

            if (matchingBooks.length > 0) {
                res.send(matchingBooks);
            } else {
                res.status(404).json({ message: "No books found for this author" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books by author", error: error.message });
        });
});
*/

// --------------------
// Get book details based on Title (async/await with Axios)
// --------------------
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();

    try {
        const response = await axios.get("http://localhost:5000/booksdata");
        const allBooks = response.data;
        const matchingBooks = [];

        Object.keys(allBooks).forEach((key) => {
            if (allBooks[key].title.toLowerCase().includes(title)) {
                matchingBooks.push(allBooks[key]);
            }
        });

        if (matchingBooks.length > 0) {
            res.send(matchingBooks);
        } else {
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});

/*
// Alternative: Promise callback style
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();

    axios.get("http://localhost:5000/booksdata")
        .then(response => {
            const allBooks = response.data;
            const matchingBooks = [];

            Object.keys(allBooks).forEach((key) => {
                if (allBooks[key].title.toLowerCase().includes(title)) {
                    matchingBooks.push(allBooks[key]);
                }
            });

            if (matchingBooks.length > 0) {
                res.send(matchingBooks);
            } else {
                res.status(404).json({ message: "No books found with this title" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books by title", error: error.message });
        });
});
*/

// --------------------
// Get book review
// --------------------
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        const reviews = book.reviews;
        if (reviews && Object.keys(reviews).length > 0) {
            res.send(reviews);
        } else {
            res.status(404).json({ message: "No reviews found for this book" });
        }
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
