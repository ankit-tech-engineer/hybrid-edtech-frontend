import api from '@/lib/axios';
import { ApiResponse, User, Role } from '@/types';

export const authService = {
  register: (data: { name: string; email: string; phone: string; role: Role }) =>
    api.post<any, ApiResponse<null>>('/auth/register', data),

  verifyOtp: (data: { email: string; otp: string; type: 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' }) =>
    api.post<any, ApiResponse<null>>('/auth/verify-otp', data),

  setPassword: (data: { email: string; password: string }) =>
    api.post<any, ApiResponse<null>>('/auth/set-password', data),

  login: (data: { email: string; password: string }) =>
    api.post<any, ApiResponse<{ token: string; role: Role }>>('/auth/login', data),

  getMe: () =>
    api.get<any, ApiResponse<User>>('/auth/me'),
};
