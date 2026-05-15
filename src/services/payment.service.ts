import api from '@/lib/axios';
import { ApiResponse, RazorpayOrderData, RazorpayResponse, Payment } from '@/types';

export const paymentService = {
  createOrder: (booking_id: string) =>
    api.post<any, ApiResponse<RazorpayOrderData>>('/payments/create-order', { booking_id }),

  verifyPayment: (data: {
    booking_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post<any, ApiResponse<null>>('/payments/verify', data),

  getPaymentDetails: (booking_id: string) =>
    api.get<any, ApiResponse<Payment>>(`/payments/${booking_id}`),
};
