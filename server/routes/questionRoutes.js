const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// 1. POST Add Question
router.post('/add', async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    const savedQuestion = await newQuestion.save();
    res.status(201).json({ message: 'Added successfully!', question: savedQuestion });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// 2. GET Questions by Exam and Level (Sorted by questionNumber)
router.get('/exam/:examId/level/:level', async (req, res) => {
  try {
    const questions = await Question.find({ examId: req.params.examId, level: req.params.level })
                                    .sort({ questionNumber: 1 }); // 1 means ascending order (1, 2, 3...)
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET ALL Questions for an Exam (Sorted by questionNumber)
router.get('/exam/:examId', async (req, res) => {
  try {
    const questions = await Question.find({ examId: req.params.examId })
                                    .sort({ questionNumber: 1 }); // Sorts them for the Admin Dashboard too!
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT: Edit Question
router.put('/:id', async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. DELETE: Remove Question
router.delete('/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;