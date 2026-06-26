const express = require('express');
const { registerUser, loginUser, getAllMembers, deleteMember } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { isLibrarian } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Member management (Librarian only)
router.get('/members', protect, isLibrarian, getAllMembers);
router.delete('/members/:id', protect, isLibrarian, deleteMember);

module.exports = router;