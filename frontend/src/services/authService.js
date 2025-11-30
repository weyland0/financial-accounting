import axios from "axios";

const API_BASE_URL = "http://localhost:5034";

export async function login(userData) {
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
}

export async function register(userData) {
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
}
