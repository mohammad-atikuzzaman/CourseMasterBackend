const mongoose = require('mongoose');

const assignmentSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        moduleIndex: {
            type: Number,
        },
        dueDate: {
            type: Date,
        },
        type: {
            type: String,
            enum: ['assignment', 'quiz'],
            default: 'assignment',
        },
        questions: [
            {
                questionText: String,
                options: [String],
                correctAnswer: Number, // Index of the correct option
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
