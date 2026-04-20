// Файл src/context/AuthContext.jsx
//   - Хранит Access Token
//   - Хранит данные пользователя
//   - Предоставляет функцию login()
//   - Оборачивает всё приложение

// AuthContext - это "глобальное хранилище" информации об авторизации
// пользователя. Вместо того чтобы передавать эту информацию через пропсы 
// (что было бы очень неудобно), мы сохраняем её в одном месте 
// и любой компонент может получить доступ.

// Файл src/context/AuthContext.jsx
//   - Хранит Access Token
//   - Хранит данные пользователя
//   - Предоставляет функцию login()
//   - Оборачивает всё приложение

// AuthContext - это "глобальное хранилище" информации об авторизации
// пользователя. Вместо того чтобы передавать эту информацию через пропсы 
// (что было бы очень неудобно), мы сохраняем её в одном месте 
// и любой компонент может получить доступ.

import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  login as loginApi,
  register as registerApi,
  normalizeAuthSession,
} from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Ошибка инициализации:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await loginApi({ email, password });
      const session = normalizeAuthSession(data);
      if (!session) {
        throw new Error('Некорректный ответ сервера');
      }

      localStorage.setItem('accessToken', session.token);
      localStorage.setItem('user', JSON.stringify(session.user));

      setToken(session.token);
      setUser(session.user);

      return { ...data, ...session };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, fullName, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await registerApi({ email, fullName, password });
      const session = normalizeAuthSession(data);
      if (!session) {
        throw new Error('Некорректный ответ сервера');
      }

      localStorage.setItem('accessToken', session.token);
      localStorage.setItem('user', JSON.stringify(session.user));

      setToken(session.token);
      setUser(session.user);

      return { ...data, ...session };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const updateUserOrganization = useCallback((organizationId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, organizationId };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const updateUserRole = useCallback((roleId, roleName) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = {
        ...prev,
        roleId,
        ...(roleName !== undefined && { roleName }),
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const hasRole = useCallback(
    (roles) => {
      if (!user?.roleName) {
        return false;
      }
      if (Array.isArray(roles)) {
        return roles.includes(user?.roleName);
      }
      return user?.roleName === roles;
    },
    [user?.roleName],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        setLoading,
        error,
        setError,
        login,
        register,
        logout,
        isAuthenticated: !!token && !loading,
        updateUserOrganization,
        updateUserRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }

  return context;
};
