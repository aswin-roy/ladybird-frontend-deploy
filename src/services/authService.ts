import { apiClient } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  /*async signup(data: SignUpData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },*/
  async signup(data: SignUpData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    name: data.name,
    email: data.email,
    password: data.password,
  });

  if (response.token) {
    localStorage.setItem('auth_token', response.token);
  }

  return response;
},


  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', data);
  },

  logout(): void {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};





