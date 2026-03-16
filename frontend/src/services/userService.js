import api from './api';


export async function getUsersByOrganization(orgId, token) {
  try {
    const response = await api.get(`/user/${orgId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.title || 
                        error.message || 
                        'Ошибка при получении списка пользователей';
    throw new Error(errorMessage);
  }
}
