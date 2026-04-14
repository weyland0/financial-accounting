import api from './api';

export async function createAccount(accountData, token) {
  try {
    const response = await api.post('/account/create', accountData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      "Ошибка при создании счета";

    throw new Error(errorMessage);
  }
}

export async function getAccount(id, token) {
  try {
    const response = await api.get(`/account/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      "Ошибка при получении счета";

    throw new Error(errorMessage);
  }
}

export async function getAllAccountsByOrganization() {
  try {
    // orgId убран из URL — бэкенд читает из JWT
    const response = await api.get('/account/get-by-organization');
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      "Ошибка при получении счетов";

    throw new Error(errorMessage);
  }
}
