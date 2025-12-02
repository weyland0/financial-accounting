import axios from "axios";

const API_BASE_URL = "http://localhost:5034";

/**
 * Создает организацию
 * @param {Object} orgData - Данные организации
 * @param {string} token - JWT токен
 * @returns {Promise<Object>} - Данные созданной организации (чистый DTO)
 * @throws {Error} - При ошибке выбрасывает исключение с деталями из ProblemDetails
 */
export async function createOrganization(orgData, token) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/organization/create`,
      orgData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // После рефакторинга: response.data содержит чистый DTO (OrganizationResponse)
    return response.data;
  } catch (error) {
    // При ошибке: error.response.data содержит ProblemDetails
    // Извлекаем сообщение об ошибке из detail или title
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
 * @param {string} token - JWT токен
 * @returns {Promise<Object>} - Данные организации (чистый DTO)
 * @throws {Error} - При ошибке выбрасывает исключение с деталями из ProblemDetails
 */
export async function getOrganization(id, token) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/organization/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    // После рефакторинга: response.data содержит чистый DTO (OrganizationResponse)
    return response.data;
  } catch (error) {
    // При ошибке: error.response.data содержит ProblemDetails
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.title || 
                        error.message || 
                        'Ошибка при получении организации';
    
    throw new Error(errorMessage);
  }
}
