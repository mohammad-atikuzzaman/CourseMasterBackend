const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, authorize('admin', 'instructor'), createCourse);

router.route('/:id')
    .get(getCourseById)
    .put(protect, authorize('admin', 'instructor'), updateCourse)
    .delete(protect, authorize('admin', 'instructor'), deleteCourse);

module.exports = router;
