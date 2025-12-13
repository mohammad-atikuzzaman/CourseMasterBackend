# CourseMaster Backend

**Overview**
- Express + Mongoose REST API for authentication, courses, enrollments, assignments, submissions, and instructors.
- Role-based access control with `protect` and `authorize` middleware.
- JSON Web Tokens for auth; CORS enabled.

**Tech Stack**
- Node.js, Express, Mongoose
- JWT for authentication
- Zod for payload validation

**Getting Started**
- Requirements: Node 18+, MongoDB Atlas/local
- Create `.env` in `backend`:
  - `MONGODB_URI=<your-mongodb-uri>`
  - `JWT_SECRET=<your-jwt-secret>`
  - `PORT=8080` (optional)
- Install and run:
  - `npm install`
  - `npm run dev` (nodemon)
  - `npm start` (production)

**API Base URL**
- Default: `http://localhost:8080/api`

**Auth**
- `POST /api/auth/register` – name, email, password, role? → returns user + token
- `POST /api/auth/login` – email, password → returns user + token
- `GET /api/auth/me` – requires `Authorization: Bearer <token>`

**Users**
- `GET /api/users` – admin only; list users
- `PUT /api/users/:id/role` – admin only; update role

**Courses**
- `GET /api/courses` – list with filters
- `GET /api/courses/:id` – course details
- `POST /api/courses` – admin/instructor; create
- `PUT /api/courses/:id` – admin/instructor; update
- `DELETE /api/courses/:id` – admin/instructor; delete

**Enrollments**
- `POST /api/enrollments` – student enrolls (`{ courseId }`)
- `GET /api/enrollments/my-courses` – student’s enrollments
- `PUT /api/enrollments/:courseId/progress` – student marks lesson complete (`{ lessonId }`)
- `GET /api/enrollments/course/:courseId` – admin/instructor view course enrollments
- `GET /api/enrollments/analytics` – admin analytics (daily counts)

**Assignments & Submissions**
- `POST /api/assignments` – admin/instructor create
- `GET /api/assignments/course/:courseId` – list course assignments
- `GET /api/assignments/course/:courseId/my-submissions` – student’s submissions for course
- `POST /api/assignments/:id/submit` – student submit (supports `repoUrl`, `deploymentUrl`, `content`) and auto-grades quizzes
- `GET /api/assignments/:id/submissions` – admin/instructor view all submissions
- `PUT /api/assignments/:id/grade/:submissionId` – admin/instructor grade (`{ score, status? }`)
- `PUT /api/assignments/:id` – admin/instructor update assignment
- `DELETE /api/assignments/:id` – admin/instructor delete assignment

**Instructors**
- `GET /api/instructors` – public list with course counts

**Auth & Roles**
- `protect` reads JWT from `Authorization` header and attaches `req.user`.
- `authorize('admin','instructor')` guards privileged routes.

**Data Models**
- `User`: name, email, password, role
- `Course`: title, description, instructor, price, category, tags, thumbnail, syllabus, batches
- `Enrollment`: student, course, progress, completedLessons, status
- `Assignment`: course, title, description, moduleIndex, dueDate, type, questions
- `Submission`: assignment, student, content, repoUrl, deploymentUrl, score, status

**Error Handling**
- Centralized via `errorMiddleware`. Non-production hides stack.

**Seeding (Optional)**
- `backend/seeder.js` imports/destroys sample users/courses (requires `data/users` and `data/courses`).
- Run: `node seeder.js` or `node seeder.js -d`

**Notes**
- CORS enabled globally.
- Ensure `JWT_SECRET` and `MONGODB_URI` are set for all environments.
- The frontend github repository link `https://github.com/mohammad-atikuzzaman/CourseMaster`