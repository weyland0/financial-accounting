// Файл src/pages/Register.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export function Register() {
  // описание состояний
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  // Получаем функции из контекста
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    setLocalError(""); // Очищаем ошибки

    // Проверка корректности данных на клиенте
    if (!email || !password || !fullName) {
      setLocalError("Все поля обязательны");
      return;
    }

    if (password.length < 8) {
      setLocalError("Пароль должен быть минимум 8 символов");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Пароли не совпадают");
      return;
    }

    try {
      await register(email, fullName, password);
      navigate("/dashboard");
    } catch (err) {
      setLocalError(err.message || "Ошибка при входе");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Регистрация в систему</h1>

        {/* Показываем ошибку если она есть */}
        {localError && <div className="error-message">{localError}</div>}

        {/* Форма логина */}
        <form onSubmit={handleSubmit}>
          {/* Email поле */}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              disabled={loading} // Отключаем во время загрузки
            />
          </div>

          {/* FullName поле */}
          <div className="form-group">
            <label htmlFor="fullName">Полное имя:</label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="your name"
              disabled={loading} // Отключаем во время загрузки
            />
          </div>

          {/* Пароль поле */}
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {/* Подтвердить пароль поле */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль:</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {/* Submit кнопка */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading} // Отключаем во время загрузки
          >
            {loading ? "Загрузка..." : "Зарегестрироваться"}
          </button>
        </form>

        {/* Ссылка на регистрацию */}
        <p className="auth-link">
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>
    </div>
  );
}
