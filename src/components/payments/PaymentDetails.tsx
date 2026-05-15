'use client';

import { useEffect, useState } from 'react';
import { paymentService } from '@/services/payment.service';
import { Payment, PaymentStatus, BookingStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2, Info } from 'lucide-react';

interface PaymentDetailsProps {
  bookingId: string;
}

export function PaymentDetails({ bookingId }: PaymentDetailsProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await paymentService.getPaymentDetails(bookingId);
        if (response.success) {
          setPayment(response.data);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !payment) {
    return null; // Don't show if no payment or error
  }

  const getStatusVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'FAILED':
        return 'destructive';
      case 'CREATED':
        return 'warning';
      case 'REFUNDED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="bg-muted/50 border-none">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Info className="h-4 w-4" /> Payment Details
            </span>
            <Badge variant={getStatusVariant(payment.status) as any}>
              {payment.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount</p>
              <p className="font-semibold">₹{(payment.amount / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
              <p className="text-sm">{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment ID</p>
              <p className="text-xs font-mono truncate">{payment.razorpay_payment_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Order ID</p>
              <p className="text-xs font-mono truncate">{payment.razorpay_order_id}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
