import axios from "axios";

const API_BASE_URL = "http://localhost:5034";

/**
 * Вход пользователя
 * @param {Object} userData - Данные для входа (email, password)
 * @returns {Promise<Object>} - Данные ответа (чистый DTO: { token, userDto })
 * @throws {Error} - При ошибке выбрасывает исключение с деталями из ProblemDetails
 */
export async function login(userData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    
    // При ошибке: error.response.data содержит ProblemDetails
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.title || 
                        error.message || 
                        'Ошибка при входе';
    
    throw new Error(errorMessage);
  }
}

/**
 * Регистрация пользователя
 * @param {Object} userData - Данные для регистрации (email, fullName, password)
 * @returns {Promise<Object>} - Данные ответа (чистый DTO: { token, userDto })
 * @throws {Error} - При ошибке выбрасывает исключение с деталями из ProblemDetails
 */
export async function register(userData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.title || 
                        error.message || 
                        'Ошибка при регистрации';
                        
    throw new Error(errorMessage);
  }
}
