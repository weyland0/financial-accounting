import axios from "axios";

const API_BASE_URL = "http://localhost:5034";

export async function createAccount(accountData, token) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/account/create`,
      accountData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

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
    const response = await axios.get(`${API_BASE_URL}/account/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

export async function getAllAccountsByOrganization(orgId, token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/account/get-by-organization/${orgId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
