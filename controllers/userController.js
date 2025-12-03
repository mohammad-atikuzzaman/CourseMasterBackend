const User = require('../models/User');
const { z } = require('zod');

const roleSchema = z.object({
  role: z.enum(['user', 'admin', 'instructor']),
});

// @desc Get all users (admin)
// @route GET /api/users
// @access Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update user role (admin cannot change own role)
// @route PUT /api/users/:id/role
// @access Private (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const { role } = roleSchema.parse(req.body);
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, updateUserRole };

