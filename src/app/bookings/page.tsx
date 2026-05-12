'use client';

import { useState, useEffect } from 'react';
import { bookingService } from '@/services/booking.service';
import { reviewService } from '@/services/review.service';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Star, MessageSquare, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useLoadingStore } from '@/store/useLoadingStore';

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  // const [loading, setLoading] = useState(true);
  const {loading, setLoading } = useLoadingStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Review Dialog State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // Cancel Dialog State
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getStudentBookings();
      if (response.success) {
        // Handle both nested and flat response structures
        const data = response.data?.bookings || response.data || [];
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async () => {
    if (!selectedBooking) return;
    try {
      const response = await bookingService.cancelBooking(selectedBooking._id, cancelReason);
      if (response.success) {
        toast.success('Booking cancelled');
        setCancelOpen(false);
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(error?.message || (typeof error === 'string' ? error : null) || 'Failed to cancel booking');
    }
  };

  const handleReview = async () => {
    if (!selectedBooking) return;
    setSubmitting(true);
    try {
      const response = await reviewService.submitReview({
        booking_id: selectedBooking._id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      if (response.success) {
        toast.success('Review submitted! Thank you.');
        setReviewOpen(false);
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(error?.message || (typeof error === 'string' ? error : null) || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'REJECTED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredBookings = (status: string) => {
    if (status === 'upcoming') return bookings.filter(b => ['PENDING', 'ACCEPTED'].includes(b.status));
    if (status === 'past') return bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));
    return bookings;
  };

  if (loading && bookings.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Manage your learning sessions</p>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="upcoming" className="px-8">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="px-8">Past & Cancelled</TabsTrigger>
        </TabsList>

        {['upcoming', 'past'].map(status => (
          <TabsContent key={status} value={status}>
            {filteredBookings(status).length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/20">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-xl font-bold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">Start your learning journey by booking a tutor today!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBookings(status).map(booking => (
                  <Card key={booking._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row justify-between items-start border-b bg-muted/10 p-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{booking.tutor?.user_id?.name}</h3>
                          <Badge className={`${getStatusColor(booking.status)} border-none`}>{booking.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{booking.tutor?.subjects?.[0]}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{format(new Date(booking.date_time), 'MMM dd, yyyy')}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(booking.date_time), 'hh:mm a')}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{booking.mode}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-primary" />
                          <span className="truncate max-w-[200px]">{booking.note || 'No notes'}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-muted/5 flex gap-2">
                      {booking.status === 'ACCEPTED' && (
                         <Button variant="outline" className="flex-1" onClick={() => {
                           setSelectedBooking(booking);
                           setCancelOpen(true);
                         }}>
                           <XCircle className="h-4 w-4 mr-2" /> Cancel
                         </Button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <Button className="flex-1" onClick={() => {
                          setSelectedBooking(booking);
                          setReviewOpen(true);
                        }}>
                          <Star className="h-4 w-4 mr-2" /> Review Tutor
                        </Button>
                      )}
                      {booking.status === 'PENDING' && (
                        <Button variant="outline" className="flex-1 text-destructive hover:text-destructive" onClick={() => {
                          setSelectedBooking(booking);
                          setCancelOpen(true);
                        }}>
                          Cancel Request
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate your session</DialogTitle>
            <DialogDescription>How was your learning experience with {selectedBooking?.tutor?.user_id?.name}?</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`h-8 w-8 ${star <= reviewData.rating ? 'text-yellow-500 fill-current' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Your Comment</Label>
              <textarea 
                className="w-full min-h-[100px] p-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none"
                placeholder="What did you like? What could be improved?"
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button onClick={handleReview} disabled={submitting || !reviewData.comment}>
              {submitting ? <Loader2 className="animate-spin" /> : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Cancel Booking</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this session? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Reason for cancellation</Label>
              <Input 
                placeholder="e.g. Schedule conflict, Emergency..." 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason}>Confirm Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
