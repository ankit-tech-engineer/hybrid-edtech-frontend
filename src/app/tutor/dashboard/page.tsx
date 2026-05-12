'use client';

import { useState, useEffect } from 'react';
import { tutorService } from '@/services/tutor.service';
import { bookingService } from '@/services/booking.service';
import { TutorProfile, Booking } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Star, DollarSign, ArrowRight, CheckCircle2, XCircle, Clock, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useLoadingStore } from '@/store/useLoadingStore';

export default function TutorDashboard() {
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  // const [loading, setLoading] = useState(true);
  const { loading, setLoading } = useLoadingStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, bookingRes] = await Promise.all([
        tutorService.getProfile(),
        bookingService.getTutorBookings()
      ]);
      if (profileRes.success) setProfile(profileRes.data);
      if (bookingRes.success) setBookings(bookingRes.data?.bookings || bookingRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const response = await bookingService.updateBookingStatus(id, status);
      if (response.success) {
        toast.success(`Booking ${status.toLowerCase()}`);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.message || (typeof error === 'string' ? error : null) || 'Failed to update booking');
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const upcomingBookings = bookings.filter(b => b.status === 'ACCEPTED').slice(0, 5);

  if (loading && !profile) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.user_id?.name}!</p>
        </div>
        {!profile && (
          <Link href="/tutor/profile">
            <Button>Complete Your Profile</Button>
          </Link>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.00</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'ACCEPTED').length}</div>
            <p className="text-xs text-muted-foreground">Sessions scheduled</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.average_rating?.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-muted-foreground">From {profile?.total_reviews || 0} reviews</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Unique learners</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Requests */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-none bg-muted/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Booking Requests</CardTitle>
                  <CardDescription>You have {pendingBookings.length} new requests to review</CardDescription>
                </div>
                <Badge variant="secondary" className="h-6">{pendingBookings.length} New</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8 bg-background rounded-xl border border-dashed">
                  <p className="text-muted-foreground">No pending requests at the moment.</p>
                </div>
              ) : (
                pendingBookings.map(booking => (
                  <div key={booking._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-background rounded-xl border shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {booking.student?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold">{booking.student?.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(booking.date_time), 'MMM dd, hh:mm a')}</span>
                          <span className="bg-primary/5 px-1.5 rounded font-medium text-primary">{booking.mode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive" onClick={() => handleBookingStatus(booking._id, 'REJECTED')}>
                        <XCircle className="h-4 w-4 mr-1" /> Decline
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => handleBookingStatus(booking._id, 'ACCEPTED')}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Schedule */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Schedule</CardTitle>
                <Link href="/tutor/bookings" className="text-sm text-primary hover:underline">View All</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {upcomingBookings.length === 0 ? (
                   <div className="p-8 text-center text-muted-foreground italic">No upcoming sessions</div>
                ) : (
                  upcomingBookings.map(booking => (
                    <div key={booking._id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
                       <div className="flex items-center gap-6">
                         <div className="text-center min-w-[60px]">
                            <p className="text-2xl font-bold leading-none">{format(new Date(booking.date_time), 'dd')}</p>
                            <p className="text-xs uppercase text-muted-foreground">{format(new Date(booking.date_time), 'MMM')}</p>
                         </div>
                         <div>
                            <p className="font-bold">{booking.student?.name}</p>
                            <p className="text-sm text-muted-foreground">{format(new Date(booking.date_time), 'hh:mm a')} • {booking.mode}</p>
                         </div>
                       </div>
                       <Button variant="ghost" size="icon">
                         <ArrowRight className="h-5 w-5" />
                       </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href="/tutor/profile" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                   <Users className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              </Link>
              <Link href="/tutor/availability" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                   <Clock className="h-4 w-4 mr-2" /> Set Availability
                </Button>
              </Link>
              <Link href="/tutor/verification" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                   <Shield className="h-4 w-4 mr-2" /> Verification Status
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Verification</span>
                  <Badge className="bg-white/20 text-white border-none">{profile?.verification_status || 'PENDING'}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Profile Completion</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                   <div className="bg-white h-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-white/70">Complete your profile to increase visibility to students.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
