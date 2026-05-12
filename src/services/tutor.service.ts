import api from '@/lib/axios';
import { ApiResponse, TutorProfile, AvailabilitySlot } from '@/types';

export interface TutorSearchParams {
  subject?: string;
  mode?: 'ONLINE' | 'OFFLINE' | 'BOTH';
  city?: string;
  page?: number;
  limit?: number;
}

export const tutorService = {
  getProfile: () =>
    api.get<any, ApiResponse<TutorProfile>>('/tutor/profile'),

  updateProfile: (data: any) =>
    api.post<any, ApiResponse<TutorProfile>>('/tutor/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<any, ApiResponse<{ url: string; public_id: string; size: number }>>('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateAvatarUrl: (avatar_url: string) =>
    api.patch<any, ApiResponse<null>>('/auth/avatar', { avatar_url }),

  uploadDocuments: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('documents', file));
    return api.post<any, ApiResponse<{ files: Array<{ url: string; public_id: string; original_name: string; resource_type: string; size: number }> }>>('/upload/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateAvailability: (availability: AvailabilitySlot[]) =>
    api.patch<any, ApiResponse<TutorProfile>>('/tutor/availability', { availability }),

  submitVerification: (data: { id_type: string; id_number: string; documents: string[] }) =>
    api.post<any, ApiResponse<null>>('/tutor/verification/submit', data),

  getVerificationDetails: () =>
    api.get<any, ApiResponse<{ submitted: boolean; status: string; details: any }>>('/tutor/verification/details'),

  getAllTutors: (params: TutorSearchParams) =>
    api.get<any, ApiResponse<{ tutors: TutorProfile[]; pagination?: { total: number; page: number; limit: number; pages: number } }>>('/tutors', { params }),

  getTutorById: (id: string) =>
    api.get<any, ApiResponse<TutorProfile>>(`/tutors/${id}`),
};
