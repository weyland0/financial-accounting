import api from './api';

/**
 * Приводит ответ POST /auth/login и /auth/register к виду { token, user }.
 * Бэкенд: плоский AuthResponse (token, id, email, fullName, roleId, organizationId, roleName).
 * Поддерживается устаревший вариант с вложенным userDto.
 *
 * @param {object} raw - response.data от axios
 * @returns {{ token: string, user: object } | null}
 */
export function normalizeAuthSession(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const token = raw.token;
  if (!token) return null;

  if (raw.id != null && raw.email != null) {
    return {
      token,
      user: {
        id: raw.id,
        email: raw.email,
        fullName: raw.fullName ?? '',
        roleId: raw.roleId ?? null,
        organizationId: raw.organizationId ?? null,
        roleName: raw.roleName ?? null,
      },
    };
  }

  const nested = raw.userDto ?? raw.UserDto;
  if (nested && nested.id != null && nested.email != null) {
    return {
      token,
      user: {
        id: nested.id,
        email: nested.email,
        fullName: nested.fullName ?? '',
        roleId: nested.roleId ?? null,
        organizationId: nested.organizationId ?? null,
        roleName: nested.roleName ?? null,
      },
    };
  }

  return null;
}

/**
 * Вход пользователя
 * @param {Object} userData - { email, password }
 * @returns {Promise<object>} - тело ответа API (плоский AuthResponse)
 */
export async function login(userData) {
  try {
    const response = await api.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при входе';

    throw new Error(errorMessage);
  }
}

/**
 * Регистрация
 * @param {Object} userData - { email, fullName, password }
 * @returns {Promise<object>} - тело ответа API (плоский AuthResponse)
 */
export async function register(userData) {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error(error);
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при регистрации';

    throw new Error(errorMessage);
  }
}
