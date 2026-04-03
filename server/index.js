const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config();

const app = express();

// UPDATED: Specific CORS configuration
app.use(cors({
  origin: "*", // Allows all origins
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
// --- Route Connections ---
const examRoutes = require('./routes/examRoutes');
app.use('/api/exams', examRoutes); 

const questionRoutes = require('./routes/questionRoutes');
app.use('/api/questions', questionRoutes); 

const resultRoutes = require('./routes/resultRoutes');
app.use('/api/results', resultRoutes);
// -------------------------

// Basic Test Route
app.get('/', (req, res) => {
  res.send('MCQ Portal Backend is running!');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Start the Server
// Ensure this matches exactly what the Proxy is looking for
// const PORT = 5000; 
// app.listen(PORT, '127.0.0.1', () => {
//   console.log(`🚀 Server is running on http://127.0.0.1:${PORT}`);
// });

// Start the Server
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});