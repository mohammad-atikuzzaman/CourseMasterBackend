const express = require('express');
const router = express.Router();
const { submitFeedback, getHomeFeedback, getCourseFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitFeedback);
router.get('/home', getHomeFeedback);
router.get('/course/:courseId', getCourseFeedback);

module.exports = router;
