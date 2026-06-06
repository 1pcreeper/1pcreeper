import axios from 'axios';
import { API_BASE_URL } from './config';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('_secure');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('_secure');
    }
    if (error.response) {
      error.message = `${error.response.data.message || 'Something went wrong'}`;
    } else if (error.request) {
      error.message = "Network Error: Please check your connection.";
    }
    return Promise.reject(error);
  }
);

api.defaults.withCredentials = true;

export default api;
