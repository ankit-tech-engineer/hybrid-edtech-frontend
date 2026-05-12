import api from '@/lib/axios';
import { ApiResponse, Booking } from '@/types';

export const bookingService = {
  createBooking: (data: { tutor_id: string; mode: 'ONLINE' | 'OFFLINE'; date_time: string; note?: string }) =>
    api.post<any, ApiResponse<Booking>>('/bookings', data),

  getStudentBookings: () =>
    api.get<any, ApiResponse<any>>('/bookings/student'),

  getTutorBookings: () =>
    api.get<any, ApiResponse<any>>('/bookings/tutor'),

  updateBookingStatus: (id: string, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') =>
    api.patch<any, ApiResponse<Booking>>(`/bookings/${id}`, { status }),

  cancelBooking: (id: string, cancel_reason: string) =>
    api.patch<any, ApiResponse<Booking>>(`/bookings/${id}/cancel`, { cancel_reason }),
};
