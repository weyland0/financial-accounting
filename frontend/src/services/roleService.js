import api from './api';


export async function getRoleById(id, token) {
  try {
    const response = await api.get(`/role/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.title || 
                        error.message || 
                        'Ошибка при получении роли';
    throw new Error(errorMessage);
  }
}

export async function getAllRoles(token) {
    try {
      const response = await api.get(`/role`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.title || 
                          error.message || 
                          'Ошибка при получении списка ролей';
      throw new Error(errorMessage);
    }
  }
