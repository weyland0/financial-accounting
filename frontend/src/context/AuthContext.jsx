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

// Создаем контекст (пока это пустой контейнер для данных).
// Позже мы его наполним данными в Provider.
// В дальнейшем он может использоваться компонентами 
// через useContext(AuthContext).
export const AuthContext = createContext();

// React-компонент Provider - оборачивает приложение.
// Provider - это компонент который "поставляет" данные в контекст.
// Здесь {children} - эо все компоненты внутри, которые получат доступ 
// к данным, находящемся в контексте
export const AuthProvider = ( { children } ) => {

  // Состояния контекста - его данные
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Получаем acessToken и данные пользователя из localStorage при загрузке компонента
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Получаем сохраненный token из localStorage
        const savedToken = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');

        // проверяем не null ли savedToken и savedUser
        if (savedToken && savedUser) {
          // Восстанавливаем данные
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }

        // ================= ДОБАВИТЬ ПРОВРЕКУ accessToken =================

      } catch (err) {
        console.error('Ошибка инициализации:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

  }, []);  // Запускается один раз при загрузке приложения

  // Функция входа
  const login = useCallback(async (email, password) => {

    setLoading(true); // Устнавливаем переменную загрузки в true
    setError(null);  // Очищаем ошибки перед новым запросом

    try {

      // Отправляем POST запрос на backend
      const response = await fetch('http://localhost:5034/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',  // Отправляем cookies вместе с запросом
      });

      // Проверяем был ли успех
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при входе');
      }

      // Получаем данные из ответа
      // data содержит: { accessToken, user }
      // Refresh Token автоматически в Cookie!
      const data = await response.json();

      // Сохраняем данные в хранилище
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.userDto));

      // Сохраняем данные в состояние
      setToken(data.token);
      setUser(data.userDto);

      return data;  // Возвращаем для использования в компоненте

    } catch (err) {
        setError(err.message);
        throw err;  // Выбрасываем ошибку чтобы компонент её обработал
    } finally {
      setLoading(false);  // Всегда выключаем loading
    }
  }, []);

  // Функция регистрации
  const register = useCallback(async (email, fullName, password) => {

    setLoading(true); // Устнавливаем переменную загрузки в true
    setError(null);  // Очищаем ошибки перед новым запросом

    try {

      const response = await fetch('http://localhost:5034/auth/registerandlogin',
      {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, fullName, password }),
          credentials: 'include'
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при регистрации');
      }

      // Получаем данные из ответа
      // data содержит: { accessToken, user }
      // Refresh Token автоматически в Cookie!
      const data = await response.json();

      // Сохраняем данные в хранилище
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.userDto));

      // Сохраняем данные в состояние
      setToken(data.token);
      setUser(data.userDto);

      return data;

    } catch (err) {
        setError(err.message || 'Ошибка при входе');
        throw err;
    } finally {
      setLoading(false);  // Всегда выключаем loading
    }

  }, []);

  // Функция для логаута
  const logout = useCallback(() => {

    // Очищаем localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Возвращаем Provider с контекстом
  return (
    <AuthContext.Provider value={{
      user, setUser,
      token, setToken,
      loading, setLoading,
      error, setError,
      login, register, logout,
      isAuthenticated: !!token && !loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// React-хук для доступа к контексту
export const useAuth = () => {

  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }

  return context;
};
