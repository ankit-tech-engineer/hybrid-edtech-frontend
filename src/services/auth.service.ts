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
    api.post<any, ApiResponse<{ accessToken: string; refreshToken: string; role: Role }>>('/auth/login', data),

  logout: (refreshToken: string) =>
    api.post<any, ApiResponse<{ logged_out: boolean }>>('/auth/logout', { refresh_token: refreshToken }),

  refreshToken: (refreshToken: string) =>
    api.post<any, ApiResponse<{ accessToken: string }>>('/auth/refresh-token', { refresh_token: refreshToken }),

  getMe: () =>
    api.get<any, ApiResponse<User>>('/auth/me'),

  forgotPassword: (email: string) =>
    api.post<any, ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; otp: string; new_password: string }) =>
    api.post<any, ApiResponse<null>>('/auth/reset-password', data),

  resendOtp: (data: { email: string; type: 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' }) =>
    api.post<any, ApiResponse<null>>('/auth/resend-otp', data),
};
