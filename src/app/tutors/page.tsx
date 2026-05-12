'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { tutorService, TutorSearchParams } from '@/services/tutor.service';
import { TutorProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Clock, BookOpen, Filter, Search, Loader2, User, Shield } from 'lucide-react';
import Link from 'next/link';
import { useLoadingStore } from '@/store/useLoadingStore';

function TutorListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const { loading, setLoading } = useLoadingStore();
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<{ subject: string; mode: string | null; city: string }>({
    subject: searchParams.get('subject') || '',
    mode: searchParams.get('mode') || 'all',
    city: searchParams.get('city') || '',
  });

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (filters.subject) params.set('subject', filters.subject);
    else params.delete('subject');
    
    if (filters.mode && filters.mode !== 'all') params.set('mode', filters.mode);
    else params.delete('mode');
    
    if (filters.city) params.set('city', filters.city);
    else params.delete('city');
    
    params.set('page', '1');
    router.push(`/tutors?${params.toString()}`);
  };

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const params: TutorSearchParams = {
        subject: searchParams.get('subject') || undefined,
        mode: (searchParams.get('mode') as any) || undefined,
        city: searchParams.get('city') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: 10,
      };
      const response = await tutorService.getAllTutors(params);
      if (response.success) {
        setTutors(response.data.tutors || []);
        setTotal(response.data.pagination?.total || response.data.tutors?.length || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg mb-4">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input 
                placeholder="Search subject..." 
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <Select 
                value={filters.mode}
                onValueChange={(val) => setFilters({ ...filters, mode: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="BOTH">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input 
                placeholder="Delhi, Mumbai..." 
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>
          </div>
          
          <Button className="w-full" onClick={handleApplyFilters}>Apply Filters</Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {loading ? 'Finding Tutors...' : `${total} Tutors Found`}
            </h1>
          </div>

          {loading && tutors.length === 0 ? (
            null
          ) : tutors.length === 0 ? (
            <div className="text-center py-20 border rounded-2xl bg-muted/20">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No tutors found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {tutors.map((tutor) => (
                <Card key={tutor._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/5 group">
                  <CardContent className="p-0">
                    <div className="flex p-6 gap-5">
                      <div className="h-24 w-24 rounded-2xl bg-primary/5 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                        {tutor.user_id?.avatar ? (
                          <img src={tutor.user_id.avatar} alt="Tutor" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <User className="h-10 w-10 text-primary/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{tutor.user_id?.name || 'Unknown Tutor'}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1 text-sm text-yellow-500 font-bold">
                                <Star className="h-4 w-4 fill-current" />
                                <span>{(tutor.average_rating || 0).toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                <Shield className="h-3 w-3" />
                                {tutor.trust_score || 0}% Trust
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-primary">${tutor.price_per_hour || 0}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">per hour</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 my-3 leading-relaxed">
                          {tutor.bio}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(tutor.subjects || []).slice(0, 2).map((sub) => (
                            <Badge key={sub} variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] px-2">
                              {sub}
                            </Badge>
                          ))}
                          {tutor.subjects.length > 2 && <span className="text-[10px] text-muted-foreground">+{tutor.subjects.length - 2} more</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 px-6 py-4 flex justify-between items-center border-t border-dashed">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary/60" />
                        <span>{tutor.experience || 0}y Experience</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary/60" />
                        <span>{tutor.mode}</span>
                      </div>
                    </div>
                    <Link href={`/tutors/${tutor._id}`}>
                      <Button size="sm" className="rounded-full px-5 h-9 font-bold">View Profile</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function TutorsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <TutorListContent />
    </Suspense>
  );
}
