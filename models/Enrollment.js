const mongoose = require('mongoose');

const enrollmentSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
        progress: {
            type: Number,
            default: 0,
        },
        completedLessons: [
            {
                type: String, // ID of the lesson/module
            },
        ],
        status: {
            type: String,
            enum: ['active', 'completed', 'dropped'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
