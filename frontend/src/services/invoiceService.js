import api from './api';

export async function createInvoice(data) {
  try {
    const response = await api.post('/invoice/create', data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при создании счета';
    throw new Error(errorMessage);
  }
}

export async function getInvoicesByOrganization(orgId) {
  try {
    const response = await api.get(`/invoice/organization/${orgId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при получении счетов';
    throw new Error(errorMessage);
  }
}

export async function payInvoice(data) {
  try {
    const response = await api.post('/invoice/pay', data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      'Ошибка при оплате счета';
    throw new Error(errorMessage);
  }
}


