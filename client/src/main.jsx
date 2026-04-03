import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // <-- This must be here
import axios from 'axios' // <-- 1. Import axios

// <-- 2. Set the base URL to your live backend
axios.defaults.baseURL = 'https://vecv-mcq-portal.onrender.com';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)