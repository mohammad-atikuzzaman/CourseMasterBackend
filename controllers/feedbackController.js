const Feedback = require('../models/Feedback');
const Enrollment = require('../models/Enrollment');

// @desc Submit feedback for a course
// @route POST /api/feedback
// @access Private (Student)
const submitFeedback = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;
    // must be enrolled
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled to submit feedback' });
    }
    const feedback = await Feedback.findOneAndUpdate(
      { course: courseId, student: req.user._id },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get latest feedback for homepage
// @route GET /api/feedback/home
// @access Public
const getHomeFeedback = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 12);
    const items = await Feedback.find({})
      .sort('-createdAt')
      .limit(limit)
      .populate('student', 'name')
      .populate('course', 'title');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get feedback for a course
// @route GET /api/feedback/course/:courseId
// @access Public
const getCourseFeedback = async (req, res) => {
  try {
    const items = await Feedback.find({ course: req.params.courseId })
      .sort('-createdAt')
      .populate('student', 'name');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitFeedback, getHomeFeedback, getCourseFeedback };
