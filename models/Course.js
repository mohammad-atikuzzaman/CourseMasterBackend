const mongoose = require('mongoose');

const moduleSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String }, // Could be video URL or text
    duration: { type: Number }, // In minutes
});

const courseSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a course title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
            default: 0,
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
        },
        tags: [String],
        thumbnail: {
            type: String,
            default: 'no-photo.jpg',
        },
        syllabus: [moduleSchema],
        batches: [
            {
                name: String,
                startDate: Date,
                endDate: Date,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Add text index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Indexes for common filters/sorting
courseSchema.index({ category: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);
