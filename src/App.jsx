import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TestSetup from './pages/TestSetup';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ctr_user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    
      <Routes>
        {user ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/test/:videoId" element={<TestSetup />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <Route path="*" element={<LoginPage setUser={setUser} />} />
        )}
      </Routes>
    
  );
}

export default App;
