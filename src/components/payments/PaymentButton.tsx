'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { paymentService } from '@/services/payment.service';
import { loadRazorpay } from '@/lib/loadRazorpay';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Loader2, CreditCard } from 'lucide-react';
import { RazorpayResponse } from '@/types';

interface PaymentButtonProps {
  bookingId: string;
  amount: number;
  disabled?: boolean;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentButton({ bookingId, amount, disabled, onSuccess }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setLoading(true);
    try {
      // 1. Load Razorpay Script
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 2. Create Order
      const response = await paymentService.createOrder(bookingId);
      if (!response.success) {
        toast.error(response.message || 'Failed to create payment order');
        return;
      }

      const orderData = response.data;

      // 3. Open Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Hybrid Tutor Marketplace',
        description: `Payment for booking #${bookingId}`,
        order_id: orderData.order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            setLoading(true);
            const verifyRes = await paymentService.verifyPayment({
              booking_id: bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              toast.success('Payment successful!');
              onSuccess?.();
            } else {
              toast.error(verifyRes.message || 'Payment verification failed');
            }
          } catch (error: any) {
            toast.error(error?.message || 'Something went wrong during verification');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed');
        setLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      {loading ? 'Processing...' : 'Pay Now'}
    </Button>
  );
}
