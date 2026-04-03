const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  fullName: String,
  employeeCode: String,
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  
  // Your awesome existing scorecard system!
  scoreCard: [
    {
      level: String,
      score: Number,
      passed: Boolean,
      // 👉 NEW ADDITION 1: This tells Mongo it's okay to hold the answers
      answers: { type: mongoose.Schema.Types.Mixed, default: {} } 
    }
  ],
  
  totalScore: { type: Number, default: 0 },
  
  // NEW: Added for the Admin Dashboard Data Table
  highestLevelAttempted: { type: String, default: 'L1' },
  status: { type: String, default: 'In Progress' },
  
  completedAt: { type: Date, default: Date.now }
  
// 👉 NEW ADDITION 2: This stops Mongo from quietly deleting data it doesn't understand
}, { strict: false }); 

module.exports = mongoose.model('Result', resultSchema);