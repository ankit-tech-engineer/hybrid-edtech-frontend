import api from '@/lib/axios';
import { ApiResponse, Review } from '@/types';

export const reviewService = {
  submitReview: (data: { booking_id: string; rating: number; comment: string }) =>
    api.post<any, ApiResponse<Review>>('/reviews', data),

  getTutorReviews: (tutorId: string, params?: { page?: number; limit?: number }) =>
    api.get<any, ApiResponse<{ reviews: Review[]; total: number }>>(`/reviews/${tutorId}`, { params }),

  reportUser: (data: { reported_user_id: string; booking_id?: string; reason: string }) =>
    api.post<any, ApiResponse<null>>('/reports', data),
};
