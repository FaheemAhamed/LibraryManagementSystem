//import express from "express"; 
const express = require('express') 
const { 
    addBook, 
    updateBook, 
    deleteBook, 
    getBookById, 
    getAllBooks, 
    searchBooks, 
    borrowBook, 
    returnBook, 
    getMyBorrowedBooks 
} = require('../controllers/bookController.js')
const { protect } = require('../middleware/authMiddleware.js')
const { isLibrarian } = require('../middleware/roleMiddleware.js')

const router = express.Router();

// Static routes first
router.get("/search", protect, searchBooks);
router.get("/my-borrowed", protect, getMyBorrowedBooks);
router.get("/", protect, getAllBooks);

// Dynamic/Admin routes
router.post("/", protect, isLibrarian, addBook);
router.get("/:id", protect, getBookById);
router.put("/:id", protect, isLibrarian, updateBook);
router.delete("/:id", protect, isLibrarian, deleteBook);
router.post("/borrow/:id", protect, borrowBook);
router.post("/return/:id", protect, returnBook);

module.exports = router;