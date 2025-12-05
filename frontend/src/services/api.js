import axios from 'axios';

const API_BASE_URL = 'http://localhost:5034';

// Создаем отдельный axios instance для refresh запросов, чтобы избежать циклических зависимостей
const refreshAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Создаем основной экземпляр axios
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Флаг для предотвращения множественных одновременных запросов на обновление токена
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов и автоматического обновления токена
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Если уже идет обновление токена, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Используем отдельный axios instance для refresh запроса, чтобы избежать циклических зависимостей
        // refresh token уходит в HttpOnly cookie, поэтому тело не требуется
        const refreshResponse = await refreshAxios.post('/auth/refresh', {});
        const response = refreshResponse.data;

        const { token: newAccessToken } = response;

        // Сохраняем новые токены
        localStorage.setItem('accessToken', newAccessToken);

        // Обновляем заголовок оригинального запроса
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Обрабатываем очередь ожидающих запросов
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Повторяем оригинальный запрос с новым токеном
        return api(originalRequest);
      } catch (refreshError) {
        // Ошибка при обновлении токена - разлогиниваем пользователя
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
