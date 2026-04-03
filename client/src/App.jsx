import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx'; // Check this path!
import AdminPortal from './pages/AdminPortal.jsx';
import StudentPortal from './pages/StudentPortal.jsx';
import ExamPage from './pages/ExamPage.jsx';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}> {/* Ensure background covers full screen */}
      <Navbar /> 
      
      <div style={{ paddingTop: '20px' }}>
        <Routes>
          <Route path="/" element={<StudentPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/exam" element={<ExamPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;