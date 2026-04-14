import api from './api';

export async function createTransaction(data) {
  try {
    const response = await api.post('/transaction/create', data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при создании операции';
    throw new Error(errorMessage);
  }
}

export async function getTransactionsByOrganization() {
  try {
    // orgId убран из URL — бэкенд читает из JWT
    const response = await api.get('/transaction/organization');
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при получении операций';
    throw new Error(errorMessage);
  }
}

