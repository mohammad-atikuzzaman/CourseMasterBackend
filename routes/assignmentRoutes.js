const express = require('express');
const router = express.Router();
const {
    createAssignment,
    getCourseAssignments,
    submitAssignment,
    getSubmissions,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'instructor'), createAssignment);
router.get('/course/:courseId', protect, getCourseAssignments);
router.get('/course/:courseId/my-submissions', protect, require('../controllers/assignmentController').getMySubmissionsByCourse);
router.post('/:id/submit', protect, submitAssignment);
router.get('/:id/submissions', protect, authorize('admin', 'instructor'), getSubmissions);
router.put('/:id/grade/:submissionId', protect, authorize('admin', 'instructor'), require('../controllers/assignmentController').gradeSubmission);
router.put('/:id', protect, authorize('admin', 'instructor'), require('../controllers/assignmentController').updateAssignment);
router.delete('/:id', protect, authorize('admin', 'instructor'), require('../controllers/assignmentController').deleteAssignment);

module.exports = router;
