import axios from 'axios';
import { authStore } from '../stores/authStore';

const client = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:8080' : '',
});

// 요청 인터셉터: 토큰 자동 주입
client.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 시 토큰 삭제 + 로그인 리다이렉트
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
