const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const port = process.env.PORT || 8080;

connectDB();

const app = express();

// Enable CORS for all origins
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', require('./routes/authRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
