const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc Register new user
// @route POST /api/users/register
// @access Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔹 Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      const err = new Error('User already exists');
      err.statusCode = 400;
      return next(err);
    }

    // 🔹 Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔹 Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    next(error);
  }
}; 

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 🔹 Check user exists
    const user = await User.findOne({ email });

    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 400;
      return next(err);
    }

    // 🔹 Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 400;
      return next(err);
    }

    // 🔹 Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 🔹 Send response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });

  } catch (error) {
    next(error);
  }
};

const getAllMembers = async (req, res, next) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password');
    res.json(members);
  } catch (error) {
    next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      const err = new Error('Member not found or not a member');
      err.statusCode = 404;
      return next(err);
    }

    // Check if member has unreturned books
    const activeBorrows = await require('../models/BorrowRecord').findOne({ memberId: member._id, status: 'borrowed' });
    if (activeBorrows) {
      const err = new Error('Cannot delete member with active borrowed books');
      err.statusCode = 400;
      return next(err);
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getAllMembers, deleteMember };