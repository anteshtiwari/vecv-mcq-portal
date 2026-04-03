import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '15px 30px',
      background: '#ffffff', // Change to white so it stands out against your dark background
      color: '#1e293b',
      alignItems: 'center',
      borderBottom: '3px solid #2563eb', // Bright blue bottom line
      position: 'relative',
      zIndex: 1000
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>VECV MCQ Portal</div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: '#1e293b', textDecoration: 'none', fontWeight: 'bold' }}>Student Login</Link>
        <Link to="/admin" style={{ color: '#1e293b', textDecoration: 'none', fontWeight: 'bold' }}>Admin Dashboard</Link>
      </div>
    </nav>
  );
}

export default Navbar;