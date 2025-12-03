const bcrypt = require('bcryptjs');

const hashedPassword = bcrypt.hashSync('123456', 10);

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'user',
    },
    {
        name: 'Jane Instructor',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'instructor',
    },
];

module.exports = users;
