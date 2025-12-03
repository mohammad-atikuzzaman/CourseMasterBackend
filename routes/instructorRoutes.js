const express = require('express');
const router = express.Router();
const { listInstructors } = require('../controllers/instructorController');

router.get('/', listInstructors);

module.exports = router;
