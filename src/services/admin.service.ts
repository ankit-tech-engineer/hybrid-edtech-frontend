import api from '@/lib/axios';
import { ApiResponse, User, Report } from '@/types';

export const adminService = {
  getPendingVerifications: () =>
    api.get<any, ApiResponse<any>>('/admin/verification?status=PENDING'),

  updateVerificationStatus: (id: string, status: 'APPROVED' | 'REJECTED') =>
    api.patch<any, ApiResponse<null>>(`/admin/verification/${id}`, { status }),

  getReports: () =>
    api.get<any, ApiResponse<any>>('/admin/reports'),

  resolveReport: (id: string) =>
    api.patch<any, ApiResponse<null>>(`/admin/reports/${id}`, { status: 'RESOLVED' }),

  getUsers: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<any, ApiResponse<any>>('/admin/users', { params }),

  toggleUserStatus: (id: string, is_active: boolean) =>
    api.patch<any, ApiResponse<null>>(`/admin/users/${id}`, { is_active }),

  getDashboardStats: () =>
    api.get<any, ApiResponse<any>>('/admin/dashboard'),

  getAnalytics: (filters: { group_by?: string; date_from?: string; date_to?: string }) =>
    api.get<any, ApiResponse<any>>('/admin/analytics', { params: filters }),
};
