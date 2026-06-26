//import express from "express"; 
const express = require('express') 
const { 
    addBook, 
    updateBook, 
    deleteBook, 
    getBookById, 
    getAllBooks, 
    borrowBook, 
    returnBook 
} = require('../controllers/bookController.js')
const { protect } = require('../middleware/authMiddleware.js')
const { isLibrarian } = require('../middleware/roleMiddleware.js')
const { validateBookAdd, validateBookUpdate } = require('../validators/bookValidator')

const router = express.Router();

// Book Management Routes
router.get("/", protect, getAllBooks);
router.post("/", protect, isLibrarian, validateBookAdd, addBook);

router.get("/:id", protect, getBookById);
router.put("/:id", protect, isLibrarian, validateBookUpdate, updateBook);
router.delete("/:id", protect, isLibrarian, deleteBook);

router.post("/:id/borrow", protect, borrowBook);
router.post("/:id/return", protect, returnBook);

module.exports = router;