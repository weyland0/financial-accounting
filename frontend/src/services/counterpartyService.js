import api from './api';

export async function createCounterparty(data) {
  try {
    const response = await api.post('/counterparty/create', data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при создании контрагента';
    throw new Error(errorMessage);
  }
}

export async function getCounterpartiesByOrganization(orgId) {
  try {
    const response = await api.get(`/counterparty/get-by-organization/${orgId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при получении контрагентов';
    throw new Error(errorMessage);
  }
}

export async function updateCounterparty(id, data) {
  try {
    const response = await api.post(`/counterparty/update/${orgId}`, data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при получении контрагентов';
    throw new Error(errorMessage);
  }
}

