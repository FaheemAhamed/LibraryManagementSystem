const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const { validateRegister, validateLogin } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

module.exports = router;
