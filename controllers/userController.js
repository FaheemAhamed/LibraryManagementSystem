const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc Register new user
// @route POST /api/users/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔹 Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
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
    res.status(500).json({ message: error.message });
  }
}; 

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Check user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 🔹 Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
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
    res.status(500).json({ message: error.message });
  }
};

const getAllMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ message: 'Member not found or not a member' });
    }

    // Check if member has unreturned books
    const activeBorrows = await require('../models/BorrowRecord').findOne({ memberId: member._id, status: 'borrowed' });
    if (activeBorrows) {
      return res.status(400).json({ message: 'Cannot delete member with active borrowed books' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getAllMembers, deleteMember };