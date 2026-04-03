const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

// 1. POST: Grade a submitted level (KEEP YOUR EXISTING CODE)
router.post('/submit-level', async (req, res) => {
  try {
    const { fullName, employeeCode, examId, level, userAnswers } = req.body;

    // A. Calculate the student's score for this specific level
    const questions = await Question.find({ examId, level });
    let levelScore = 0;
    
    questions.forEach(q => {
      if (userAnswers[q._id] === q.correctAnswer) {
        levelScore += (q.marks || 1);
      }
    });

    // B. Get the required passing marks
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    let passingMarks = 0;
    if (level === 'L1') passingMarks = exam.passingMarksL1 || 0;
    else if (level === 'L2') passingMarks = exam.passingMarksL2 || 0;
    else if (level === 'L3') passingMarks = exam.passingMarksL3 || 0;
    else if (level === 'L4') passingMarks = exam.passingMarksL4 || 0;

    const passed = levelScore >= passingMarks;

    // D. Find existing result or create a new one
    let result = await Result.findOne({ examId, employeeCode });
    if (!result) {
      result = new Result({ 
        examId, 
        fullName, 
        employeeCode,
        totalScore: 0,
        scoreCard: [] 
      });
    }

    result.scoreCard = result.scoreCard.filter(s => s.level !== level);
    result.scoreCard.push({
      level: level,
      score: levelScore,
      passed: passed,
      answers: userAnswers 
    });

    result.totalScore = result.scoreCard.reduce((sum, item) => sum + item.score, 0);
    result.highestLevelAttempted = level;
    result.completedAt = new Date();
    
    if (passed) {
      if (level === 'L4') {
        result.status = 'Fully Completed & Passed';
      } else {
        result.status = `Passed ${level}, Proceeding`;
      }
    } else {
      result.status = `Failed at ${level}`;
    }
    
    await result.save();
    res.json({ passed, score: levelScore, required: passingMarks, status: result.status });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET: Fetch all results for Admin
router.get('/exam/:examId', async (req, res) => {
  try {
    const results = await Result.find({ examId: req.params.examId }).sort({ completedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- NEW SECURITY CHECK ADDED HERE ---
// 3. GET: Check if an employee has already attempted this specific exam
router.get('/check-attempt/:examId/:employeeCode', async (req, res) => {
  try {
    const { examId, employeeCode } = req.params;
    
    // Look for a result that matches BOTH the exam and the employee code
    const existingResult = await Result.findOne({ examId, employeeCode });
    
    // If we find one, it means they already submitted at least Level 1
    if (existingResult) {
      return res.json({ attempted: true });
    }
    
    // Otherwise, they are clear to start
    res.json({ attempted: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
