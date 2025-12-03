const express = require('express');
const router = express.Router();
const {
    enrollStudent,
    getMyCourses,
    updateProgress,
    getEnrollmentsByCourse,
    getEnrollmentAnalytics,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All routes are protected

router.post('/', enrollStudent);
router.get('/my-courses', getMyCourses);
router.put('/:courseId/progress', updateProgress);

// Admin/Instructor: view enrollments
router.get('/course/:courseId', authorize('admin', 'instructor'), getEnrollmentsByCourse);

// Admin: analytics
router.get('/analytics', authorize('admin'), getEnrollmentAnalytics);

module.exports = router;
