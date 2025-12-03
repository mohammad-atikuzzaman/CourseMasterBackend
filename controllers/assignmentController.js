const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

// @desc    Create an assignment
// @route   POST /api/assignments
// @access  Private (Admin/Instructor)
const createAssignment = async (req, res) => {
    try {
        const { courseId, title, description, dueDate, type, questions, moduleIndex } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const assignment = await Assignment.create({
            course: courseId,
            title,
            description,
            dueDate,
            type,
            questions,
            moduleIndex,
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getCourseAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
    try {
        const { content, answers, repoUrl, deploymentUrl } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Auto-grade if quiz
        let score = null;
        let status = 'submitted';

        if (assignment.type === 'quiz' && answers) {
            let correctCount = 0;
            assignment.questions.forEach((q, index) => {
                if (q.correctAnswer === answers[index]) {
                    correctCount++;
                }
            });
            score = (correctCount / assignment.questions.length) * 100;
            status = 'graded';
        }

        const submission = await Submission.create({
            assignment: req.params.id,
            student: req.user._id,
            content,
            repoUrl,
            deploymentUrl,
            score,
            status,
        });

        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (Admin/Instructor)
const getSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Ownership check: admin can access all; instructor only if owns the course
        const course = await Course.findById(assignment.course);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'name email');
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my submissions for a course
// @route   GET /api/assignments/course/:courseId/my-submissions
// @access  Private
const getMySubmissionsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId }).select('_id');
        const assignmentIds = assignments.map(a => a._id);
        const mySubs = await Submission.find({ assignment: { $in: assignmentIds }, student: req.user._id })
            .sort('-createdAt');
        res.json(mySubs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Grade a submission (manual grading)
// @route   PUT /api/assignments/:id/grade/:submissionId
// @access  Private (Admin/Instructor)
const gradeSubmission = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Ownership check
        const course = await Course.findById(assignment.course);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { score, status } = req.body;
        const submission = await Submission.findByIdAndUpdate(
            req.params.submissionId,
            { score, status: status || 'graded' },
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an assignment (title/description/dueDate/type/questions/moduleIndex)
// @route   PUT /api/assignments/:id
// @access  Private (Admin/Instructor)
const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const course = await Course.findById(assignment.course);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const fields = ['title','description','dueDate','type','questions','moduleIndex'];
        fields.forEach(f => {
            if (req.body[f] !== undefined) assignment[f] = req.body[f];
        });
        await assignment.save();
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Admin/Instructor)
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const course = await Course.findById(assignment.course);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await assignment.deleteOne();
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAssignment,
    getCourseAssignments,
    submitAssignment,
    getSubmissions,
    getMySubmissionsByCourse,
    gradeSubmission,
    // new methods exported below
    updateAssignment,
    deleteAssignment,
};
