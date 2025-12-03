const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String, // Link or text answer
        },
        repoUrl: {
            type: String,
        },
        deploymentUrl: {
            type: String,
        },
        score: {
            type: Number,
        },
        status: {
            type: String,
            enum: ['submitted', 'graded'],
            default: 'submitted',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Submission', submissionSchema);
