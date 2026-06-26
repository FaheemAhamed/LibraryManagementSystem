const express = require('express');
const { getAllMembers, deleteMember } = require('../controllers/userController');
const { getMyBorrowedBooks } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { isLibrarian } = require('../middleware/roleMiddleware');

const router = express.Router();

// Get books currently borrowed by logged-in member (must be before /:id)
router.get('/me/books', protect, getMyBorrowedBooks);

// Librarian only routes
router.get('/', protect, isLibrarian, getAllMembers);
router.delete('/:id', protect, isLibrarian, deleteMember);

module.exports = router;
