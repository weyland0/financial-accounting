import api from './api';


export async function createInvite(data, token) {
  try {
    const response = await api.post(`/invite/create`, data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.title || 
                        error.message || 
                        'Ошибка при создании пригласительной ссылки';
    throw new Error(errorMessage);
  }
}

export async function getInvite(invite_token, token) {
  try {
    const response = await api.get(`/invite/${invite_token}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.title || 
                        error.message || 
                        'Ошибка при создании пригласительной ссылки';
    throw new Error(errorMessage);
  }
}

export async function acceptInvite(invite_token, userId) {
    try {
      const response = await api.put(`/invite/accept/${invite_token}`, {userId});
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.title || 
                          error.message || 
                          'Ошибка при получении организации';
      throw new Error(errorMessage);
    }
}