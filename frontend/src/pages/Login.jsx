import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export const Login = () => {
  // Состояние формы
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  // Получаем функции из контекста
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    setLocalError(""); // Очищаем ошибки

    // Проверка корректности данных на клиенте
    if (!email || !password) {
      setLocalError("Email и пароль обязательны");
      return;
    }

    if (password.length < 8) {
      setLocalError('Пароль должен быть минимум 8 символов');
      return;
    }

    try {
      // Вызываем login из контекста
      await login(email, password);

      // Если успешно → перенаправляем на dashboard
      navigate("/dashboard");
    } catch (err) {
      setLocalError(err.message || "Ошибка при входе");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Вход в систему</h1>

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

          {/* Submit кнопка */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading} // Отключаем во время загрузки
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>

        {/* Ссылка на регистрацию */}
        <p className="auth-link">
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
};
