const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 🔹 Get token
      token = req.headers.authorization.split(' ')[1];

      // 🔹 Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🔹 Get user from DB
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next();

    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, not authorized' });
  }
}; 

// Librarian only
const librarianOnly = (req, res, next) => {
  if (req.user && req.user.role === 'librarian') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Librarian only.' });
  }
};

module.exports = { protect, librarianOnly };

