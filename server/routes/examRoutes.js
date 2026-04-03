const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Question = require('../models/Question'); // Needed to delete questions when an exam is deleted

// 1. CREATE Exam
router.post('/create', async (req, res) => {
  try {
    const newExam = new Exam(req.body);
    const savedExam = await newExam.save();
    res.status(201).json(savedExam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET All Exams
router.get('/', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET Active Exam (Now looks for the manual switch!)
router.get('/active', async (req, res) => {
  try {
    const activeExam = await Exam.findOne({ isActive: true });
    if (!activeExam) return res.status(404).json({ message: "No active exam set by Admin." });
    res.json(activeExam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT: Set an Exam as Active (and turn others off)
router.put('/set-active/:id', async (req, res) => {
  try {
    await Exam.updateMany({}, { isActive: false }); // Turn all off
    const activeExam = await Exam.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    res.json(activeExam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. PUT: Edit Exam Details
router.put('/:id', async (req, res) => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedExam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. DELETE Exam (and its questions)
router.delete('/:id', async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    await Question.deleteMany({ examId: req.params.id }); // Clean up attached questions
    res.json({ message: "Exam and associated questions deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;