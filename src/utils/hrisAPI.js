import axios from "axios";

const hrisAPI = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_HRIS,
  timeout: 15000,
  withCredentials: true,
});


hrisAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("hris-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
hrisAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hris-token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default hrisAPI;
