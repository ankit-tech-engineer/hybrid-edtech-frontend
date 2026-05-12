'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tutorService } from '@/services/tutor.service';
import { bookingService } from '@/services/booking.service';
import { reviewService } from '@/services/review.service';
import { TutorProfile, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Clock, BookOpen, Calendar, MessageSquare, Shield, CheckCircle2, Loader2, User, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useLoadingStore } from '@/store/useLoadingStore';

export default function TutorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { loading, setLoading } = useLoadingStore();
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Booking Form State
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    mode: 'ONLINE' as 'ONLINE' | 'OFFLINE',
    note: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tutorRes, reviewRes] = await Promise.all([
        tutorService.getTutorById(id as string),
        reviewService.getTutorReviews(id as string)
      ]);
      if (tutorRes.success) setTutor(tutorRes.data);
      if (reviewRes.success) setReviews(reviewRes.data.reviews);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tutor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a session');
      router.push('/login');
      return;
    }
    
    if (role !== 'STUDENT') {
      toast.error('Only students can book sessions');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await bookingService.createBooking({
        tutor_id: id as string,
        mode: bookingData.mode,
        date_time: `${bookingData.date}T${bookingData.time}:00.000Z`,
        note: bookingData.note,
      });
      if (response.success) {
        toast.success('Booking requested successfully!');
        router.push('/bookings');
      }
    } catch (error: any) {
      toast.error(error?.message || (typeof error === 'string' ? error : null) || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading && !tutor) return null;

  if (!tutor) return <div className="text-center py-20">Tutor not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-2 space-y-8">
          <section className="flex flex-col md:flex-row gap-8 items-start bg-card p-8 rounded-3xl border shadow-sm">
            <div className="h-32 w-32 md:h-48 md:w-48 rounded-3xl bg-primary/5 flex-shrink-0 flex items-center justify-center border-2 border-primary/10 overflow-hidden">
              {tutor.user_id?.avatar ? (
                <img src={tutor.user_id.avatar} alt="Tutor" className="w-full h-full object-cover" />
              ) : (
                <User className="h-20 w-20 text-primary/30" />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{tutor.user_id?.name || 'Unknown Tutor'}</h1>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-foreground">{(tutor.average_rating || 0).toFixed(1)}</span>
                  <span>({tutor.total_reviews || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  <span>{tutor.experience || 0} Years Experience</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-5 w-5" />
                  <span>{tutor.mode} ({tutor.location?.city})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-blue-600">{tutor.trust_score || 0}% Trust Score</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(tutor.subjects || []).map(sub => (
                  <Badge key={sub} variant="secondary" className="px-3 py-1">{sub}</Badge>
                ))}
              </div>
            </div>
          </section>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-6">
              <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3">About</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-6">
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold mb-4">Biography</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tutor.bio}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Qualifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(tutor.qualifications || []).map((qual, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-primary/5">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{qual.degree} in {qual.field}</h4>
                        <p className="text-xs text-muted-foreground">{qual.institution} • {qual.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 rounded-2xl border-dashed border-2">
                    <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">No reviews yet for this tutor.</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <Card key={review._id} className="border-none shadow-sm bg-muted/30">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {review.student?.name?.[0]}
                            </div>
                            <div>
                              <p className="font-bold">{review.student?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24 shadow-xl border-primary/10">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-2xl font-bold flex items-baseline gap-1">
                ${tutor.price_per_hour || 0} <span className="text-sm font-normal text-muted-foreground">/ hour</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Input 
                  type="date" 
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Select Time</Label>
                <Input 
                  type="time" 
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Learning Mode</Label>
                <Select 
                  value={bookingData.mode}
                  onValueChange={(val: any) => setBookingData({ ...bookingData, mode: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online Session</SelectItem>
                    <SelectItem value="OFFLINE">In-person Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes for Tutor (Optional)</Label>
                <Input 
                  placeholder="Tell the tutor what you want to learn..." 
                  value={bookingData.note}
                  onChange={(e) => setBookingData({ ...bookingData, note: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button 
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
                onClick={handleBooking}
                disabled={bookingLoading || !bookingData.date || !bookingData.time}
              >
                {bookingLoading ? <Loader2 className="animate-spin" /> : 'Book Now'}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="bg-muted/30 p-6 rounded-2xl border border-dashed text-center">
            <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
            <h4 className="font-bold">Flexible Scheduling</h4>
            <p className="text-xs text-muted-foreground">Reschedule or cancel up to 24h before the session starts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
