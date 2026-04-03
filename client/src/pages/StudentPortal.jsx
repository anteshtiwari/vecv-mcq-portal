import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function StudentPortal() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({ fullName: '', employeeCode: '' });
  const [activeExam, setActiveExam] = useState(null);

  // Check for active exams as soon as the page loads
  useEffect(() => {
    const checkActiveExam = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/exams/active');
        setActiveExam(res.data);
      } catch (err) {
        setActiveExam(null); // No exam found or error
      }
    };
    checkActiveExam();
  }, []);

  const handleStartExam = (e) => {
    e.preventDefault();
    if (!activeExam) {
      alert("No active exam found at this time. Please check the schedule.");
      return;
    }
    navigate('/exam', { 
      state: { 
        fullName: candidate.fullName, 
        employeeCode: candidate.employeeCode,
        examId: activeExam._id 
      } 
    });
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#2563eb' }}>Candidate Login</h2>
      
      {activeExam ? (
        <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '5px', marginBottom: '20px', color: '#166534' }}>
          <strong>Active Exam Found:</strong> {activeExam.title}
        </div>
      ) : (
        <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '5px', marginBottom: '20px', color: '#991b1b' }}>
          No exams are currently active.
        </div>
      )}

      <form onSubmit={handleStartExam} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" name="fullName" placeholder="Full Name" onChange={(e) => setCandidate({...candidate, fullName: e.target.value})} required style={{ padding: '10px' }} />
        <input type="text" name="employeeCode" placeholder="Employee Code" onChange={(e) => setCandidate({...candidate, employeeCode: e.target.value})} required style={{ padding: '10px' }} />
        <button type="submit" disabled={!activeExam} style={{ padding: '15px', background: activeExam ? '#16a34a' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: activeExam ? 'pointer' : 'not-allowed' }}>
          Start Exam
        </button>
      </form>
    </div>
  );
}

export default StudentPortal;