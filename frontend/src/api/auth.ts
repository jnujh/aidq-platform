import client from './client';

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export const authApi = {
  signup(data: SignupRequest) {
    return client.post('/api/users/signup', data);
  },

  login(data: LoginRequest) {
    return client.post<{ success: boolean; data: LoginResponse }>('/api/users/login', data);
  },
};
