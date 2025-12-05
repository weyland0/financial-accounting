import api from './api';

export async function createCategory(categoryData, token) {
  try {
    const response = await api.post('/category/create', categoryData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      "Ошибка при создании категории";

    throw new Error(errorMessage);
  }
}

export async function getCategoriesByOrganization(orgId, token) {
  try {
    const response = await api.get(`/category/organization/${orgId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      "Ошибка при получении категорий";

    throw new Error(errorMessage);
  }
}

