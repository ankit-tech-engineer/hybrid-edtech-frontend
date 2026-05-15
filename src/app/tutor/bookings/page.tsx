'use client';

import { useState, useEffect } from 'react';
import { bookingService } from '@/services/booking.service';
import { Booking } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useLoadingStore } from '@/store/useLoadingStore';

export default function TutorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  // const [loading, setLoading] = useState(true);
  const { loading, setLoading } = useLoadingStore();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getTutorBookings();
      if (response.success) setBookings(response.data?.bookings || response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') => {
    try {
      const response = await bookingService.updateBookingStatus(id, status);
      if (response.success) {
        toast.success(`Booking ${status.toLowerCase()}`);
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(error?.message || (typeof error === 'string' ? error : null) || 'Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-700 border-none">Pending</Badge>;
      case 'ACCEPTED': return <Badge className="bg-blue-100 text-blue-700 border-none">Accepted</Badge>;
      case 'CONFIRMED': return <Badge className="bg-green-100 text-green-700 border-none font-bold">Confirmed</Badge>;
      case 'COMPLETED': return <Badge className="bg-emerald-100 text-emerald-700 border-none">Completed</Badge>;
      case 'CANCELLED': return <Badge className="bg-red-100 text-red-700 border-none">Cancelled</Badge>;
      case 'REJECTED': return <Badge className="bg-gray-100 text-gray-700 border-none">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Bookings</h1>
        <p className="text-muted-foreground">Track and update your tutoring sessions</p>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking._id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {booking.student?.name?.[0]}
                        </div>
                        <span className="font-medium text-sm">{booking.student?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{format(new Date(booking.date_time), 'MMM dd, yyyy')}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(booking.date_time), 'hh:mm a')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="font-normal">{booking.mode}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status === 'PENDING' && (
                          <>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleStatusUpdate(booking._id, 'REJECTED')}>Decline</Button>
                            <Button size="sm" onClick={() => handleStatusUpdate(booking._id, 'ACCEPTED')}>Accept</Button>
                          </>
                        )}
                        {(booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(booking._id, 'COMPLETED')}>Mark Completed</Button>
                        )}
                        {['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status) && (
                           <span className="text-xs text-muted-foreground italic">No actions</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
