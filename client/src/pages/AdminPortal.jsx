import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function AdminPortal() {
  const [view, setView] = useState('login'); 
  const [hubTab, setHubTab] = useState('create'); 
  const [adminAuth, setAdminAuth] = useState({ email: '', password: '' });
  
  // --- STATES FOR VIEWING RESPONSES ---
  const [selectedResult, setSelectedResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Create States
  const [examFormData, setExamFormData] = useState({ 
    title: '', startTime: '', endTime: '', 
    durationL1: 10, durationL2: 10, durationL3: 10, durationL4: 10,
    passingMarksL1: 0, passingMarksL2: 0, passingMarksL3: 0, passingMarksL4: 0 
  });
  
  const [selectedExamId, setSelectedExamId] = useState('');
  const [questionData, setQuestionData] = useState({ questionNumber: 1, marks: 1, level: 'L1', questionText: '', opt1: '', opt2: '', opt3: '', opt4: '', correctAnswer: '' });

  // Manage States
  const [allExams, setAllExams] = useState([]);
  const [viewingQuestionsFor, setViewingQuestionsFor] = useState(null); 
  const [fetchedQuestions, setFetchedQuestions] = useState([]);
  const [viewingResultsFor, setViewingResultsFor] = useState(null);
  const [fetchedResults, setFetchedResults] = useState([]);

  // Edit States
  const [editingExamId, setEditingExamId] = useState(null);
  const [editExamData, setEditExamData] = useState({});
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionData, setEditQuestionData] = useState({});

  // --- HELPER FUNCTIONS ---
  const getLevelScore = (result, levelName) => {
    const record = result.scoreCard?.find(s => s.level === levelName);
    return record ? record.score : '-';
  };

  const getFinalStatus = (res) => {
    if (res.status === 'Fully Completed & Passed') return 'Fully Completed & Passed';
    if (res.status === 'Failed at L4') return 'L3 Completed & Passed';
    if (res.status === 'Failed at L3') return 'L2 Completed & Passed';
    if (res.status === 'Failed at L2') return 'L1 Completed & Passed';
    return res.status; 
  };

  // --- API HANDLERS ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminAuth.email === "Vecvadminetb@vecvnet.com" && adminAuth.password === "Etb1234567890") {
      setView('hub'); fetchExams();
    } else alert("❌ Invalid Credentials!");
  };

  const fetchExams = async () => {
    const res = await axios.get('/api/exams'); setAllExams(res.data);
  };

  const submitExam = async (e) => {
    e.preventDefault();
    const res = await axios.post('/api/exams/create', examFormData);
    setSelectedExamId(res.data._id); setView('questions'); alert('✅ Exam Created!');
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    const payload = {
      examId: selectedExamId, questionNumber: Number(questionData.questionNumber), marks: Number(questionData.marks), 
      level: questionData.level, questionText: questionData.questionText,
      options: [questionData.opt1, questionData.opt2, questionData.opt3, questionData.opt4], correctAnswer: questionData.correctAnswer
    };
    await axios.post('/api/questions/add', payload);
    setQuestionData({ ...questionData, questionNumber: Number(questionData.questionNumber) + 1, marks: 1, questionText: '', opt1: '', opt2: '', opt3: '', opt4: '', correctAnswer: '' });
    alert('✅ Question Added!');
  };

  const toggleViewResults = async (examId) => {
    if (viewingResultsFor === examId) return setViewingResultsFor(null);
    const resR = await axios.get(`/api/results/exam/${examId}`);
    setFetchedResults(resR.data);
    const resQ = await axios.get(`/api/questions/exam/${examId}`);
    setFetchedQuestions(resQ.data);
    setViewingResultsFor(examId); setViewingQuestionsFor(null);
  };

  const handleDownloadExcel = (examTitle) => {
    const excelData = fetchedResults.map((res) => ({
      "Full Name": res.fullName, "Employee Code": res.employeeCode,
      "L1": getLevelScore(res, 'L1'), "L2": getLevelScore(res, 'L2'), "L3": getLevelScore(res, 'L3'), "L4": getLevelScore(res, 'L4'),
      "Total Score": res.totalScore, "Status": res.status, "Final Status": getFinalStatus(res),
      "Date": res.completedAt ? new Date(res.completedAt).toLocaleString() : "N/A"
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `${examTitle}_Detailed_Report.xlsx`);
  };

  // --- MANAGEMENT CONTROLS ---
  const handleSetActive = async (id) => {
    await axios.put(`/api/exams/set-active/${id}`); fetchExams(); alert("✅ LIVE!");
  };
  const handleDeleteExam = async (id) => {
    if(!window.confirm("🚨 Delete Exam?")) return;
    await axios.delete(`/api/exams/${id}`); fetchExams();
  };
  const handleUpdateExam = async (id) => {
    await axios.put(`/api/exams/${id}`, editExamData); setEditingExamId(null); fetchExams(); alert("✅ Updated!");
  };
  const toggleViewQuestions = async (examId) => {
    if (viewingQuestionsFor === examId) return setViewingQuestionsFor(null);
    const res = await axios.get(`/api/questions/exam/${examId}`);
    setFetchedQuestions(res.data); setViewingQuestionsFor(examId); setViewingResultsFor(null);
  };
  const handleDeleteQuestion = async (id, examId) => {
    await axios.delete(`/api/questions/${id}`); toggleViewQuestions(examId); 
  };
  const handleUpdateQuestion = async (id, examId) => {
    const payload = { ...editQuestionData, options: [editQuestionData.opt1, editQuestionData.opt2, editQuestionData.opt3, editQuestionData.opt4] };
    await axios.put(`/api/questions/${id}`, payload); setEditingQuestionId(null); toggleViewQuestions(examId); 
  };

  // --- RESPONSIVE UI STYLES ---
  const responsiveStyles = `
    .admin-container { padding: 20px; max-width: 1400px; margin: 0 auto; color: white; font-family: sans-serif; }
    .admin-card { background: #1e293b; padding: 30px; border-radius: 15px; width: 100%; box-sizing: border-box; }
    .btn-group { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .btn-group button { flex: 1 1 200px; padding: 15px; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .form-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-bottom: 15px; }
    .exam-item { background: #0f172a; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .action-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
    .action-buttons { display: flex; gap: 5px; flex-wrap: wrap; }
    .table-responsive { overflow-x: auto; border: 1px solid #334155; border-radius: 8px; margin-top: 10px; }
    .data-table { width: 100%; border-collapse: collapse; min-width: 600px; }
    
    @media (max-width: 768px) {
      .admin-container { padding: 10px; }
      .admin-card { padding: 15px; }
      .action-row { flex-direction: column; align-items: flex-start; }
    }
  `;

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', marginBottom: '10px', boxSizing: 'border-box' };
  const btnStyle = { padding: '10px 15px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
  const tdStyle = { padding: '12px', borderBottom: '1px solid #334155', textAlign: 'left', fontSize: '12px' };

  return (
    <div className="admin-container">
      <style>{responsiveStyles}</style>
      
      {/* 1. LOGIN */}
      {view === 'login' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh' }}>
          <div className="admin-card" style={{ maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <h2 style={{ textAlign: 'center', color: '#60a5fa' }}>Admin Login</h2>
            <form onSubmit={handleAdminLogin}>
              <input type="email" placeholder="Admin ID" style={inputStyle} onChange={(e) => setAdminAuth({...adminAuth, email: e.target.value})} required />
              <input type="password" placeholder="Password" style={inputStyle} onChange={(e) => setAdminAuth({...adminAuth, password: e.target.value})} required />
              <button type="submit" style={{ ...btnStyle, background: '#2563eb', width: '100%', padding: '15px', fontSize: '16px', marginTop: '10px' }}>Login</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADMIN DASHBOARD */}
      {view === 'hub' && (
        <div className="admin-card">
          <div className="btn-group">
            <button onClick={() => setHubTab('create')} style={{ ...btnStyle, background: hubTab === 'create' ? '#2563eb' : '#334155' }}>+ Create New Exam</button>
            <button onClick={() => { setHubTab('manage'); fetchExams(); }} style={{ ...btnStyle, background: hubTab === 'manage' ? '#10b981' : '#334155' }}>⚙️ Manage Exams</button>
          </div>

          {/* CREATE EXAM */}
          {hubTab === 'create' && (
            <form onSubmit={submitExam}>
              <input type="text" placeholder="Exam Title" onChange={(e) => setExamFormData({...examFormData, title: e.target.value})} required style={inputStyle} />
              
              <div className="form-grid" style={{ marginBottom: '15px' }}>
                <div><label style={{fontSize:'12px', color:'#94a3b8'}}>Start Time</label><input type="datetime-local" onChange={(e) => setExamFormData({...examFormData, startTime: e.target.value})} required style={inputStyle} /></div>
                <div><label style={{fontSize:'12px', color:'#94a3b8'}}>End Time</label><input type="datetime-local" onChange={(e) => setExamFormData({...examFormData, endTime: e.target.value})} required style={inputStyle} /></div>
              </div>

              <h4 style={{color: '#94a3b8', margin: '0 0 10px 0'}}>Level Time Limits (Minutes)</h4>
              <div className="form-grid-4">
                {['L1', 'L2', 'L3', 'L4'].map(lvl => (
                  <div key={lvl}>
                    <label style={{fontSize:'11px'}}>{lvl} Time</label>
                    <input type="number" value={examFormData[`duration${lvl}`]} onChange={(e) => setExamFormData({...examFormData, [`duration${lvl}`]: e.target.value})} style={inputStyle} required />
                  </div>
                ))}
              </div>

              <h4 style={{color: '#94a3b8', margin: '0 0 10px 0'}}>Passing Marks Requirements</h4>
              <div className="form-grid-4">
                {['L1', 'L2', 'L3', 'L4'].map(lvl => (
                  <div key={lvl}>
                    <label style={{fontSize:'11px'}}>{lvl} Pass</label>
                    <input type="number" onChange={(e) => setExamFormData({...examFormData, [`passingMarks${lvl}`]: e.target.value})} style={inputStyle} required />
                  </div>
                ))}
              </div>
              
              <button type="submit" style={{...btnStyle, background: '#2563eb', width: '100%', marginTop: '10px', padding: '15px', fontSize: '16px'}}>Create Exam</button>
            </form>
          )}

          {/* MANAGE EXAMS */}
          {hubTab === 'manage' && (
            <div>
              {allExams.map((exam) => (
                <div key={exam._id} className="exam-item" style={{ border: exam.isActive ? '2px solid #10b981' : '1px solid #334155' }}>
                  
                  {/* EDIT EXAM FORM */}
                  {editingExamId === exam._id ? (
                    <div>
                        <input type="text" defaultValue={exam.title} onChange={(e) => setEditExamData({...editExamData, title: e.target.value})} style={inputStyle} />
                        
                        <h4 style={{color: '#94a3b8', fontSize: '11px', margin: '5px 0'}}>Duration per Level (Minutes)</h4>
                        <div className="form-grid-4">
                          {['L1', 'L2', 'L3', 'L4'].map(lvl => (
                            <div key={lvl}>
                              <label style={{fontSize:'10px'}}>{lvl} Time</label>
                              <input type="number" defaultValue={exam[`duration${lvl}`] || 10} onChange={(e) => setEditExamData({...editExamData, [`duration${lvl}`]: e.target.value})} style={inputStyle} />
                            </div>
                          ))}
                        </div>

                        <h4 style={{color: '#94a3b8', fontSize: '11px', margin: '5px 0'}}>Passing Marks</h4>
                        <div className="form-grid-4">
                          {['L1', 'L2', 'L3', 'L4'].map(lvl => (
                            <div key={lvl}>
                              <label style={{fontSize:'10px'}}>{lvl} Pass</label>
                              <input type="number" defaultValue={exam[`passingMarks${lvl}`]} onChange={(e) => setEditExamData({...editExamData, [`passingMarks${lvl}`]: e.target.value})} style={inputStyle} />
                            </div>
                          ))}
                        </div>
                        <div style={{display: 'flex', gap: '10px'}}>
                          <button onClick={() => handleUpdateExam(exam._id)} style={{...btnStyle, background: '#10b981'}}>Save</button>
                          <button onClick={() => setEditingExamId(null)} style={{...btnStyle, background: '#64748b'}}>Cancel</button>
                        </div>
                    </div>
                  ) : (
                    // EXAM CONTROLS
                    <div className="action-row">
                      <div>
                        <h3 style={{margin: 0}}>{exam.title} {exam.isActive && "✅"}</h3>
                        <p style={{fontSize:'12px', color:'#94a3b8', margin: '5px 0 0 0'}}>
                          Timers: L1({exam.durationL1}m) L2({exam.durationL2}m) L3({exam.durationL3}m) L4({exam.durationL4}m) <br/>
                          Pass Marks: L1({exam.passingMarksL1}) L2({exam.passingMarksL2}) L3({exam.passingMarksL3}) L4({exam.passingMarksL4})
                        </p>
                      </div>
                      <div className="action-buttons">
                        <button onClick={() => handleSetActive(exam._id)} style={{...btnStyle, background: exam.isActive ? '#1e293b' : '#2563eb', fontSize:'11px'}}>{exam.isActive ? 'Active' : 'Publish'}</button>
                        <button onClick={() => { setEditingExamId(exam._id); setEditExamData(exam); }} style={{...btnStyle, background: '#eab308', color:'black', fontSize:'11px'}}>Edit</button>
                        <button onClick={() => toggleViewQuestions(exam._id)} style={{...btnStyle, background: '#475569', fontSize:'11px'}}>{viewingQuestionsFor === exam._id ? 'Hide Qs' : 'View Qs'}</button>
                        <button onClick={() => toggleViewResults(exam._id)} style={{...btnStyle, background: '#a855f7', fontSize:'11px'}}>{viewingResultsFor === exam._id ? 'Hide Results' : 'View Results'}</button>
                        <button onClick={() => handleDeleteExam(exam._id)} style={{...btnStyle, background: '#ef4444', fontSize:'11px'}}>Delete</button>
                      </div>
                    </div>
                  )}

                  {/* VIEW RESULTS TABLE */}
                  {viewingResultsFor === exam._id && (
                    <div style={{ marginTop: '20px' }}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', flexWrap: 'wrap', gap: '10px'}}>
                        <h4 style={{color:'#a855f7', margin: 0}}>Student Submissions</h4>
                        <button onClick={() => handleDownloadExcel(exam.title)} style={{...btnStyle, background: '#10b981', fontSize:'11px'}}>📊 Download Excel</button>
                      </div>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr style={{ background: '#334155' }}><th style={tdStyle}>Name</th><th style={tdStyle}>Emp Code</th><th style={tdStyle}>L1</th><th style={tdStyle}>L2</th><th style={tdStyle}>L3</th><th style={tdStyle}>L4</th><th style={tdStyle}>Total</th><th style={tdStyle}>Status</th><th style={tdStyle}>Final Status</th><th style={tdStyle}>Time</th><th style={tdStyle}>Action</th></tr></thead>
                          <tbody>
                            {fetchedResults.map((res) => (
                              <tr key={res._id} style={{borderBottom: '1px solid #1e293b'}}>
                                <td style={tdStyle}>{res.fullName}</td>
                                <td style={tdStyle}>{res.employeeCode}</td>
                                <td style={tdStyle}>{getLevelScore(res, 'L1')}</td>
                                <td style={tdStyle}>{getLevelScore(res, 'L2')}</td>
                                <td style={tdStyle}>{getLevelScore(res, 'L3')}</td>
                                <td style={tdStyle}>{getLevelScore(res, 'L4')}</td>
                                <td style={{...tdStyle, color:'#10b981', fontWeight: 'bold'}}>{res.totalScore}</td>
                                <td style={{...tdStyle, color: res.status.includes('Failed') ? '#ef4444' : '#eab308'}}>{res.status}</td>
                                <td style={{...tdStyle, color:'#60a5fa'}}>{getFinalStatus(res)}</td>
                                <td style={{...tdStyle, fontSize:'10px'}}>{res.completedAt ? new Date(res.completedAt).toLocaleString() : 'N/A'}</td>
                                <td style={tdStyle}>
                                  <button onClick={() => { setSelectedResult(res); setShowModal(true); }} style={{...btnStyle, background:'#60a5fa', fontSize:'10px'}}>View Resp.</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* VIEW QUESTIONS */}
                  {viewingQuestionsFor === exam._id && (
                    <div style={{marginTop:'15px', background:'#1e293b', padding:'15px', borderRadius:'8px'}}>
                      {fetchedQuestions.map(q => (
                        <div key={q._id} style={{borderBottom:'1px solid #334155', padding:'15px 0'}}>
                          {editingQuestionId === q._id ? (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                               <div className="form-grid">
                                 <input type="number" defaultValue={q.questionNumber} onChange={(e)=>setEditQuestionData({...editQuestionData, questionNumber: e.target.value})} style={inputStyle} placeholder="Q Number" />
                                 <input type="number" defaultValue={q.marks} onChange={(e)=>setEditQuestionData({...editQuestionData, marks: e.target.value})} style={inputStyle} placeholder="Marks" />
                               </div>
                               <textarea defaultValue={q.questionText} onChange={(e)=>setEditQuestionData({...editQuestionData, questionText: e.target.value})} style={{...inputStyle, minHeight: '80px'}} />
                               <div className="form-grid">
                                {q.options.map((opt, i)=>(<input key={i} defaultValue={opt} onChange={(e)=>setEditQuestionData({...editQuestionData, [`opt${i+1}`]: e.target.value})} style={inputStyle} />))}
                               </div>
                               <input defaultValue={q.correctAnswer} onChange={(e)=>setEditQuestionData({...editQuestionData, correctAnswer: e.target.value})} style={{...inputStyle, borderColor:'#10b981'}} />
                               <div style={{display: 'flex', gap: '10px'}}>
                                <button onClick={()=>handleUpdateQuestion(q._id, exam._id)} style={{...btnStyle, background:'#10b981'}}>Save</button>
                                <button onClick={()=>setEditingQuestionId(null)} style={{...btnStyle, background:'#64748b'}}>Cancel</button>
                               </div>
                            </div>
                          ) : (
                            <div className="action-row">
                              <p style={{margin:0, fontSize:'14px', flex: 1}}><strong>Q{q.questionNumber} ({q.level}) - {q.marks} Marks:</strong> {q.questionText}</p>
                              <div className="action-buttons">
                                <button onClick={()=>{setEditingQuestionId(q._id); setEditQuestionData({...q, opt1:q.options[0], opt2:q.options[1], opt3:q.options[2], opt4:q.options[3]});}} style={{...btnStyle, background:'#eab308', fontSize:'11px', color:'black'}}>Edit Q</button>
                                <button onClick={()=>handleDeleteQuestion(q._id, exam._id)} style={{...btnStyle, background:'#ef4444', fontSize:'11px'}}>Delete Q</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <button onClick={() => { setSelectedExamId(exam._id); setView('questions'); }} style={{...btnStyle, background:'#2563eb', marginTop:'15px', width:'100%', padding: '12px'}}>+ Add Question</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ADD QUESTION VIEW */}
      {/* 3. ADD QUESTION VIEW */}
      {view === 'questions' && (
         <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
         <h2 style={{ color: '#10b981', marginBottom: '20px' }}>Add Question #{questionData.questionNumber}</h2>
         <form onSubmit={submitQuestion}>
           
           {/* --- UPDATED PART: ADDED EXPLICIT LABELS --- */}
           <div className="form-grid" style={{ marginBottom: '15px' }}>
             <div>
               <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Question Number</label>
               <input type="number" value={questionData.questionNumber} onChange={(e)=>setQuestionData({...questionData, questionNumber: e.target.value})} style={inputStyle} required />
             </div>
             <div>
               <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Marks</label>
               <input type="number" value={questionData.marks} onChange={(e)=>setQuestionData({...questionData, marks: e.target.value})} style={{...inputStyle, borderColor:'#eab308'}} required />
             </div>
             <div>
               <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Difficulty Level</label>
               <select value={questionData.level} onChange={(e)=>setQuestionData({...questionData, level: e.target.value})} style={inputStyle}>
                 <option value="L1">L1 (LEVEL 1) </option><option value="L2">L2 (LEVEL 2) </option><option value="L3">L3 (LEVEL 3) </option><option value="L4">L4 (LEVEL 4) </option>
               </select>
             </div>
           </div>
           {/* ------------------------------------------- */}

           <textarea placeholder="Question Text" value={questionData.questionText} onChange={(e) => setQuestionData({...questionData, questionText: e.target.value})} required style={{ ...inputStyle, minHeight: '100px' }} />
           
           <div className="form-grid">
             {['opt1', 'opt2', 'opt3', 'opt4'].map((opt, i) => (<input key={opt} type="text" placeholder={`Option ${i+1}`} value={questionData[opt]} onChange={(e) => setQuestionData({...questionData, [opt]: e.target.value})} required style={inputStyle} />))}
           </div>
           
           <input type="text" placeholder="Correct Answer (Must match one option exactly)" value={questionData.correctAnswer} onChange={(e) => setQuestionData({...questionData, correctAnswer: e.target.value})} required style={{ ...inputStyle, border: '2px solid #10b981' }} />
           
           <button type="submit" style={{...btnStyle, background: '#10b981', width: '100%', padding:'15px', fontSize: '16px', marginTop: '10px'}}>Add Question</button>
         </form>
         
         <button onClick={() => setView('hub')} style={{...btnStyle, background: '#475569', width: '100%', marginTop: '15px', padding: '15px'}}>Back to Dashboard</button>
       </div>
      )}

      {/* --- TABULAR RESPONSE POPUP MODAL (Fixed Duplication Bug & Mobile Overflow) --- */}
      {showModal && selectedResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, padding: '10px', boxSizing: 'border-box' }}>
          <div style={{ background: '#1e293b', padding: '25px', borderRadius: '15px', width: '100%', maxWidth: '1000px', maxHeight: '95vh', overflowY: 'auto', border: '1px solid #334155' }}>
            
            <div className="action-row" style={{ borderBottom: '1px solid #475569', paddingBottom: '15px', marginBottom:'20px' }}>
              <div>
                <h2 style={{margin:0, color: '#60a5fa'}}>Candidate Response: {selectedResult?.fullName || "Unknown"}</h2>
                <p style={{color:'#94a3b8', margin:'5px 0 0 0'}}>Code: {selectedResult?.employeeCode || "N/A"} | Final Status: {selectedResult ? getFinalStatus(selectedResult) : "N/A"}</p>
              </div>
              <button onClick={() => { setShowModal(false); setSelectedResult(null); }} style={{ ...btnStyle, background: '#ef4444', padding: '10px 20px' }}>Close Window</button>
            </div>

            {(!selectedResult.scoreCard || selectedResult.scoreCard.length === 0) ? (
              <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed #ef4444', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#ef4444', fontStyle: 'italic', margin: 0 }}>⚠️ No test data was found for this candidate.</p>
              </div>
            ) : (
              /* FIX: We filter the scoreCard to ensure only the LAST entry for each level is shown */
              selectedResult.scoreCard
                .filter((levelData, index, self) => 
                  index === self.findLastIndex((t) => t.level === levelData.level)
                )
                .map((levelData, idx) => (
                  <div key={idx} style={{ marginBottom: '30px' }}>
                    <div style={{ background: '#334155', padding: '12px 15px', borderRadius: '8px', marginBottom: '15px' }}>
                      <h3 style={{ color: '#10b981', margin: 0 }}>{levelData?.level || "Unknown"} Section (Score: {levelData?.score || 0})</h3>
                    </div>

                    {(!levelData.answers || Object.keys(levelData.answers).length === 0) ? (
                       <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed #ef4444', borderRadius: '8px', textAlign: 'center' }}>
                         <p style={{ color: '#ef4444', fontStyle: 'italic', margin: 0 }}>⚠️ Detailed answers were not saved for this past attempt.</p>
                       </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr style={{ background: '#0f172a', borderBottom: '2px solid #334155' }}>
                              <th style={tdStyle}>Q#</th>
                              <th style={tdStyle}>Question Text</th>
                              <th style={tdStyle}>Candidate Ticked</th>
                              <th style={tdStyle}>Correct Answer</th>
                              <th style={{...tdStyle, textAlign: 'center'}}>Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(levelData.answers || {}).map(([qId, studentAns]) => {
                              const q = fetchedQuestions.find(f => f._id === qId);
                              const isCorrect = q ? q.correctAnswer === studentAns : false;

                              return (
                                <tr key={qId} style={{ borderBottom: '1px solid #1e293b', background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
                                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{q ? q.questionNumber : '-'}</td>
                                  <td style={{ ...tdStyle, whiteSpace: 'normal', minWidth: '250px', lineHeight: '1.4' }}>{q ? q.questionText : "N/A"}</td>
                                  <td style={{ ...tdStyle, color: isCorrect ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{studentAns}</td>
                                  <td style={{ ...tdStyle, color: '#60a5fa' }}>{q?.correctAnswer || "N/A"}</td>
                                  <td style={{ ...tdStyle, textAlign: 'center', fontSize: '16px' }}>{isCorrect ? '✅' : '❌'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPortal;