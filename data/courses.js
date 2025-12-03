const courses = [
    {
        title: 'Full Stack MERN Bootcamp',
        description: 'Learn MERN stack from scratch to advanced.',
        price: 99.99,
        category: 'Web Development',
        tags: ['mern', 'react', 'node', 'mongodb'],
        thumbnail: 'https://via.placeholder.com/150',
        syllabus: [
            { title: 'Introduction to React', content: 'Video URL', duration: 60 },
            { title: 'Node.js Basics', content: 'Video URL', duration: 45 },
        ],
    },
    {
        title: 'Advanced React Patterns',
        description: 'Master advanced React patterns and hooks.',
        price: 49.99,
        category: 'Web Development',
        tags: ['react', 'frontend'],
        thumbnail: 'https://via.placeholder.com/150',
        syllabus: [
            { title: 'HOCs', content: 'Video URL', duration: 30 },
            { title: 'Render Props', content: 'Video URL', duration: 30 },
        ],
    },
];

module.exports = courses;
