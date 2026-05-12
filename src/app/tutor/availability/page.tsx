'use client';

import { useState, useEffect } from 'react';
import { tutorService } from '@/services/tutor.service';
import { AvailabilitySlot } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Clock, Save, Loader2, Calendar } from 'lucide-react';
import { useLoadingStore } from '@/store/useLoadingStore';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  // const [loading, setLoading] = useState(true);
  const { loading, setLoading } = useLoadingStore();
  const [submitting, setSubmitting] = useState(false);

  const fetchAvailability = async () => {
    try {
      const response = await tutorService.getProfile();
      if (response.success) {
        setAvailability(response.data.availability || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleToggleDay = (day: typeof DAYS[number], checked: boolean) => {
    if (checked) {
      setAvailability([...availability, { day, start_time: '09:00', end_time: '17:00' }]);
    } else {
      setAvailability(availability.filter(slot => slot.day !== day));
    }
  };

  const handleTimeChange = (day: string, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(availability.map(slot => 
      slot.day === day ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const response = await tutorService.updateAvailability(availability);
      if (response.success) {
        toast.success('Availability updated successfully!');
      }
    } catch (error: any) {
      toast.error(error?.message || (typeof error === 'string' ? error : null) || 'Failed to update availability');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Weekly Availability</h1>
          <p className="text-muted-foreground">Set your working hours for students to book sessions</p>
        </div>
        <Calendar className="h-12 w-12 text-primary/20" />
      </div>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-xl">Regular Weekly Hours</CardTitle>
          <CardDescription>Configure the days and times you are available for tutoring</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {DAYS.map((day) => {
            const slot = availability.find(s => s.day === day);
            const isActive = !!slot;

            return (
              <div key={day} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors ${isActive ? 'bg-primary/5 border-primary/20' : 'bg-background'}`}>
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <Switch 
                    checked={isActive} 
                    onCheckedChange={(checked) => handleToggleDay(day, checked)} 
                  />
                  <Label className={`text-base font-bold capitalize ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {day.toLowerCase()}
                  </Label>
                </div>

                {isActive ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="time" 
                        className="w-32 h-10" 
                        value={slot.start_time}
                        onChange={(e) => handleTimeChange(day, 'start_time', e.target.value)}
                      />
                    </div>
                    <span className="text-muted-foreground">to</span>
                    <Input 
                      type="time" 
                      className="w-32 h-10" 
                      value={slot.end_time}
                      onChange={(e) => handleTimeChange(day, 'end_time', e.target.value)}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Unavailable</span>
                )}
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="bg-muted/30 p-6 flex justify-between items-center border-t">
          <p className="text-sm text-muted-foreground">
            {availability.length} days active this week
          </p>
          <Button onClick={handleSave} disabled={submitting} className="px-8 shadow-lg shadow-primary/20">
            {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Save Availability
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
