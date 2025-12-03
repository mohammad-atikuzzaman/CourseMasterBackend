const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private (Student)
const enrollStudent = async (req, res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        const enrollment = await Enrollment.create({
            student: req.user._id,
            course: courseId,
        });

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my enrolled courses
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
const getMyCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate('course')
            .sort('-createdAt');

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get enrollments for a course (admin/instructor)
// @route   GET /api/enrollments/course/:courseId
// @access  Private (Admin/Instructor)
const getEnrollmentsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Admin can see all; instructor can see only their course
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view enrollments for this course' });
        }

        const enrollments = await Enrollment.find({ course: courseId })
            .populate('student', 'name email')
            .sort('-createdAt');

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enrollment analytics over time (daily counts)
// @route   GET /api/enrollments/analytics
// @access  Private (Admin)
const getEnrollmentAnalytics = async (req, res) => {
    try {
        // Only admin allowed
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { from, to } = req.query;
        const match = {};
        if (from || to) {
            match.createdAt = {};
            if (from) match.createdAt.$gte = new Date(from);
            if (to) match.createdAt.$lte = new Date(to);
        }

        const results = await Enrollment.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({ data: results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course progress
// @route   PUT /api/enrollments/:courseId/progress
// @access  Private (Student)
const updateProgress = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Add lesson to completed list if not already there
        if (!enrollment.completedLessons.includes(lessonId)) {
            enrollment.completedLessons.push(lessonId);
        }

        // Calculate progress
        const course = await Course.findById(courseId);
        const totalLessons = course.syllabus.length;

        if (totalLessons > 0) {
            enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;
        } else {
            enrollment.progress = 100;
        }

        if (enrollment.progress === 100) {
            enrollment.status = 'completed';
        }

        await enrollment.save();

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    enrollStudent,
    getMyCourses,
    updateProgress,
    // Admin APIs
    getEnrollmentsByCourse,
    getEnrollmentAnalytics,
};
