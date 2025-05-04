import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TestSetup from './pages/TestSetup';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ctr_user');
    return stored ? JSON.parse(stored) : null;
  });
  

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage setUser={setUser} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          user ? (
            <Dashboard user={user} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      {/* Optional: Catch-all route for unknown URLs */}
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/'} replace />}
      />

<Route
  path="/test/:videoId"
  element={
    user ? <TestSetup /> : <Navigate to="/" replace />
  }
/>

    </Routes>
  );
}

export default App;
