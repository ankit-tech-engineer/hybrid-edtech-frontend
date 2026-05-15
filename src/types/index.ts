export type Role = 'STUDENT' | 'TUTOR' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  is_active: boolean;
  avatar?: string;
  createdAt: string;
}

export interface Qualification {
  degree: string;
  field: string;
  institution: string;
  year: number;
  certificate: string;
}

export interface TutorProfile {
  _id: string;
  user_id: User;
  bio: string;
  subjects: string[];
  qualifications: Qualification[];
  experience: number;
  price_per_hour: number;
  mode: 'ONLINE' | 'OFFLINE' | 'BOTH';
  location: {
    city: string;
    area: string;
  };
  availability: AvailabilitySlot[];
  id_type?: string;
  id_number?: string;
  documents?: string[];
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  average_rating: number;
  total_reviews: number;
  trust_score: number;
}

export interface AvailabilitySlot {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  start_time: string; // HH:mm
  end_time: string; // HH:mm
}

export type PaymentStatus = 'CREATED' | 'PAID' | 'FAILED' | 'REFUNDED';
export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export interface Booking {
  _id: string;
  student_id: string;
  tutor_id: string;
  mode: 'ONLINE' | 'OFFLINE';
  date_time: string;
  status: BookingStatus;
  note?: string;
  cancel_reason?: string;
  tutor?: TutorProfile;
  student?: User;
  payment_status?: PaymentStatus;
  amount?: number;
  createdAt: string;
}

export interface Payment {
  _id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  createdAt: string;
}

export interface RazorpayOrderData {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  booking_id: string;
  tutor_price: number;
  platform_fee: number;
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface Review {
  _id: string;
  booking_id: string;
  tutor_id: string;
  student_id: string;
  rating: number;
  comment: string;
  student?: User;
  createdAt: string;
}

export interface Report {
  _id: string;
  reporter_id: string;
  reported_user_id: string;
  booking_id?: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED';
  reporter?: User;
  reported_user?: User;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
