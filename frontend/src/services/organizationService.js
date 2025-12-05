import api from './api';

/**
 * Создает организацию
 * @param {Object} orgData - Данные организации
 * @param {string} token - JWT токен (необязательно, используется из localStorage через interceptor)
 * @returns {Promise<Object>} - Данные созданной организации (чистый DTO)
 * @throws {Error} - При ошибке выбрасывает исключение с деталями из ProblemDetails
 */
export async function createOrganization(orgData, token) {
  try {
    const response = await api.post('/organization/create', orgData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.title || 
                        error.message || 
                        'Ошибка при создании организации';
    throw new Error(errorMessage);
  }
}

/**
 * Получает организацию по ID
 * @param {number} id - ID организации
 * @param {string} token - JWT токен (необязательно, используется из localStorage через interceptor)
 * @returns {Promise<Object>} - Данные организации (чистый DTO)
 * @throws {Error} - При ошибке выбрасывает исключение с деталями из ProblemDetails
 */
export async function getOrganization(id, token) {
  try {
    const response = await api.get(`/organization/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.title || 
                        error.message || 
                        'Ошибка при получении организации';
    throw new Error(errorMessage);
  }
}
