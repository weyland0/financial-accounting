import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Финансовая система</h1>
        <div className="header-right">
          <span>Привет, {user?.email}!</span>
          <button onClick={handleLogout} className="btn-logout">
            Выход
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <h2>✅ Вы успешно авторизованы!</h2>
        <p>Email: {user?.email}</p>
        <p>Имя: {user?.fullName}</p>
      </main>
    </div>
  );
};
