const User = require('../models/User');
const Course = require('../models/Course');

// @desc List instructors
// @route GET /api/instructors
// @access Public
const listInstructors = async (req, res) => {
  try {
    // get instructors from users and course counts
    const instructors = await User.find({ role: 'instructor' }).select('name email');
    const courseCounts = await Course.aggregate([
      { $group: { _id: '$instructor', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(courseCounts.map((c) => [String(c._id), c.count]));
    const result = instructors.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      courses: countMap.get(String(u._id)) || 0,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { listInstructors };
