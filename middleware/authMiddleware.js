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
        const err = new Error('Not authorized, user not found');
        err.statusCode = 401;
        return next(err);
      }

      return next();

    } catch (error) {
      const err = new Error('Not authorized, token failed');
      err.statusCode = 401;
      return next(err);
    }
  }

  if (!token) {
    const err = new Error('No token, not authorized');
    err.statusCode = 401;
    return next(err);
  }
}; 

// Librarian only
const librarianOnly = (req, res, next) => {
  if (req.user && req.user.role === 'librarian') {
    next();
  } else {
    const err = new Error('Access denied. Librarian only.');
    err.statusCode = 403;
    return next(err);
  }
};

module.exports = { protect, librarianOnly };

