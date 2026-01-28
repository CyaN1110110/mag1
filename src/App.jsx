// src/App.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Login from './components/Login';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
        setCurrentPage('home');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <div className="app">
      {currentPage === 'home' && (
        <Home
          user={user}
          onAdminClick={() => setCurrentPage('admin')}
          onLogout={() => setUser(null)}
        />
      )}
      {currentPage === 'admin' && (
        <AdminPanel
          user={user}
          onBackClick={() => setCurrentPage('home')}
        />
      )}
    </div>
  );
}

export default App;
