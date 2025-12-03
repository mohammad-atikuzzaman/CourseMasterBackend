const Course = require('../models/Course');
const { z } = require('zod');

// Zod Schema for Course
const courseSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be positive'),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    syllabus: z.array(
        z.object({
            title: z.string(),
            content: z.string().url('Must be a valid URL').optional(),
            duration: z.number().optional(),
        })
    ).optional(),
    batches: z.array(
        z.object({
            name: z.string(),
            startDate: z.string().or(z.date()), // Accept string from JSON
            endDate: z.string().or(z.date()).optional(),
        })
    ).optional(),
});

// @desc    Get all courses with filtering, sorting, pagination
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

        // Build query
        const query = {};

        if (search) {
            query.$text = { $search: search };
        }

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Sort
        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else sortOption.createdAt = -1; // Default: newest first

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        const courses = await Course.find(query)
            .populate('instructor', 'name email')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const total = await Course.countDocuments(query);

        res.json({
            courses,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name email');

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Admin/Instructor)
const createCourse = async (req, res) => {
    try {
        const validatedData = courseSchema.parse(req.body);

        const course = await Course.create({
            ...validatedData,
            instructor: req.user._id,
        });

        res.status(201).json(course);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Instructor)
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check ownership or admin
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Admin/Instructor)
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check ownership or admin
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await course.deleteOne();
        res.json({ message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
};
