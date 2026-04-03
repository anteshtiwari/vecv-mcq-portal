const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  
  // NEW: Admin sets this in minutes (e.g., 10 for 10 minutes per level)
  durationL1: { type: Number, default: 10 },
  durationL2: { type: Number, default: 10 },
  durationL3: { type: Number, default: 10 },
  durationL4: { type: Number, default: 10 },

  isLevelBased: { type: Boolean, default: true },
  isActive: { type: Boolean, default: false }, 
  
  passingMarksL1: { type: Number, default: 0 },
  passingMarksL2: { type: Number, default: 0 },
  passingMarksL3: { type: Number, default: 0 },
  passingMarksL4: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Exam', examSchema);