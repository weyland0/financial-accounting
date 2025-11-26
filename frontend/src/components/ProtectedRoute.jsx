// Файл src/components/ProtectedRoute.jsx
//
// Проверяет авторизован ли пользователь:
//   - Если нет -> перенаправляет на /login
//   - Если да -> показывает страницу


import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Пока проверяем статус -> показываем loading
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  // Если не авторизован -> перенаправляем на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если авторизован -> показываем страницу
  return children;
};
