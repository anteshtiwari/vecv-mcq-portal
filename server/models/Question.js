const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  questionNumber: { type: Number, required: true },
  
  // NEW: Store the marks/points for this specific question
  marks: { type: Number, required: true, default: 1 }, 
  
  level: { type: String, required: true, default: 'L1' },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);