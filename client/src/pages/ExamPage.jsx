import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ExamPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fullName, employeeCode, examId } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentLevel, setCurrentLevel] = useState('L1');
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); 
  const [examConfig, setExamConfig] = useState(null); 
  const timerRef = useRef(null);
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!fullName || !examId) return navigate('/');
    const getExam = async () => {
      try { const res = await axios.get(`/api/exams/active`); setExamConfig(res.data); } catch (err) { console.error(err); }
    };
    getExam();
  }, []);

  useEffect(() => {
    if (!examConfig) return;
    const minutes = examConfig[`duration${currentLevel}`] || 10;
    setTimeLeft(minutes * 60);
    isSubmitting.current = false;
    fetchLevelQuestions();
    setUserAnswers({}); 
  }, [currentLevel, examConfig]);

  useEffect(() => {
    if (timeLeft === 0) return; 
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft]); 

  const fetchLevelQuestions = async () => {
    try { const res = await axios.get(`/api/questions/exam/${examId}/level/${currentLevel}`); setQuestions(res.data); } catch (err) { console.error(err); }
  };

  const handleAutoSubmit = () => {
    if (isSubmitting.current) return;
    alert(`⏰ Time is up for ${currentLevel}! Auto-submitting...`);
    submitLevel();
  };

  const submitLevel = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await axios.post('/api/results/submit-level', { fullName, employeeCode, examId, level: currentLevel, userAnswers });
      const { passed, score, required } = res.data;

      if (passed) {
        alert(`✅ You scored ${score}/${required}. Passed ${currentLevel}!`);
        if (currentLevel === 'L1') setCurrentLevel('L2');
        else if (currentLevel === 'L2') setCurrentLevel('L3');
        else if (currentLevel === 'L3') setCurrentLevel('L4');
        else { alert("🎉 Congratulations! You have completed the entire exam."); navigate('/'); }
      } else {
        alert(`❌ You scored ${score}, but ${required} was required. Exam ends here.`);
        navigate('/'); 
      }
    } catch (err) {
      alert("Error submitting exam.");
      isSubmitting.current = false;
    }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;

  return (
    <div style={{ padding: '15px', maxWidth: '800px', margin: '0 auto', color: 'white', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{textAlign: 'left'}}>
          <h2 style={{ margin: 0 }}>{currentLevel} Section</h2>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>Candidate: {fullName}</p>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: timeLeft < 60 ? '#ef4444' : '#22c55e', background: '#1e293b', padding: '10px 20px', borderRadius: '8px' }}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
        {questions.map((q, idx) => (
          <div key={q._id} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Q{idx + 1}: {q.questionText}</p>
            {q.options.map((opt, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', marginBottom: '10px', border: userAnswers[q._id] === opt ? '1px solid #2563eb' : '1px solid transparent' }}>
                <input type="radio" name={q._id} checked={userAnswers[q._id] === opt} onChange={() => setUserAnswers({...userAnswers, [q._id]: opt})} style={{ marginRight: '15px', width:'18px', height:'18px' }} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      <button onClick={submitLevel} style={{ width: '100%', padding: '18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', marginTop: '20px' }}>
        Submit {currentLevel} Answers
      </button>
    </div>
  );
}

export default ExamPage;