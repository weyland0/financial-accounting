import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>

      {/* AuthProvider оборачивает всё приложение */}
      <AuthProvider>
        <Routes>
          {/* Публичный маршрут - login */}
          <Route path="/login" element={<Login />} />

          {/* Публичный маршрут - register */}
          <Route path="/register" element={<Register />} />

          {/* Защищенный маршрут - dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* По умолчанию редирект на dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - редирект на dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;
