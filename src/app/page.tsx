'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, BookOpen, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState({
    subject: '',
    mode: 'ONLINE' as string,
    city: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      subject: search.subject,
      mode: search.mode,
      city: search.city,
    }).toString();
    router.push(`/tutors?${query}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Find Your Perfect <span className="text-primary">Hybrid Tutor</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Connect with top-rated tutors for online or offline personalized learning sessions.
          </p>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <BookOpen className="h-5 w-5 text-slate-400 mr-2" />
              <Input
                placeholder="What subject?"
                className="border-0 focus-visible:ring-0 text-slate-900 text-lg placeholder:text-slate-400"
                value={search.subject}
                onChange={(e) => setSearch({ ...search, subject: e.target.value })}
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <MapPin className="h-5 w-5 text-slate-400 mr-2" />
              <Input
                placeholder="Which city?"
                className="border-0 focus-visible:ring-0 text-slate-900 text-lg placeholder:text-slate-400"
                value={search.city}
                onChange={(e) => setSearch({ ...search, city: e.target.value })}
              />
            </div>
            <div className="w-full md:w-48 flex items-center px-4 py-2">
              <Select
                value={search.mode}
                onValueChange={(value) => setSearch({ ...search, mode: value || 'ONLINE' })}
              >
                <SelectTrigger className="border-0 focus:ring-0 text-slate-900 text-lg">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="BOTH">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="h-14 px-8 rounded-xl text-lg font-bold shadow-lg" onClick={handleSearch}>
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>1000+ Expert Tutors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Online & In-person</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Verified Profiles</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Subjects</h2>
              <p className="text-muted-foreground">Explore tutors in high-demand fields</p>
            </div>
            <Button variant="ghost" className="hidden md:flex items-center gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Mathematics', 'Physics', 'Computer Science', 'English', 'Biology', 'Chemistry', 'Music', 'Economics'].map((sub) => (
              <div 
                key={sub}
                className="group p-6 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => router.push(`/tutors?subject=${sub}`)}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-1">{sub}</h3>
                <p className="text-sm text-muted-foreground">120+ Tutors available</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
