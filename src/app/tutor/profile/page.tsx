'use client';

import { useState, useEffect } from 'react';
import { tutorService } from '@/services/tutor.service';
import { TutorProfile } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, User, Briefcase, DollarSign, MapPin, BookOpen, Upload, X, Trash2, Plus, FileText, GraduationCap, School, Eye, Edit } from 'lucide-react';
import { useLoadingStore } from '@/store/useLoadingStore';

const qualificationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  institution: z.string().min(1, 'Institution is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future'),
  certificate: z.string().url('Invalid certificate URL'),
});

const profileSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  subjects: z.string().min(1, 'Please enter at least one subject'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  price_per_hour: z.number().min(1, 'Hourly rate must be at least 1'),
  mode: z.enum(['ONLINE', 'OFFLINE', 'BOTH']),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  qualifications: z.array(qualificationSchema).min(1, 'At least one qualification is required'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const STATIC_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
  'Computer Science', 'History', 'Geography', 'Economics', 
  'Business Studies', 'Accounting', 'Art', 'Music', 
  'Physical Education', 'Social Studies'
];

export default function TutorProfilePage() {
  const { loading, setLoading } = useLoadingStore();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCertIndex, setUploadingCertIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<TutorProfile | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      qualifications: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "qualifications"
  });

  const subjectsValue = watch('subjects') || '';
  const currentSubjects = subjectsValue ? subjectsValue.split(',').map(s => s.trim()).filter(Boolean) : [];

  const addSubject = (subject: string) => {
    if (!currentSubjects.includes(subject)) {
      const newSubjects = [...currentSubjects, subject];
      setValue('subjects', newSubjects.join(', '));
    }
  };

  const removeSubject = (subject: string) => {
    const newSubjects = currentSubjects.filter(s => s !== subject);
    setValue('subjects', newSubjects.join(', '));
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await tutorService.getProfile();
      if (response.success) {
        setProfile(response.data);
        reset({
          bio: response.data.bio,
          subjects: (response.data.subjects || []).join(', '),
          experience: response.data.experience,
          price_per_hour: response.data.price_per_hour,
          mode: response.data.mode,
          city: response.data.location?.city || '',
          area: response.data.location?.area || '',
          qualifications: response.data.qualifications || [],
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [reset]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit');
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploadRes = await tutorService.uploadAvatar(file);
      if (uploadRes.success) {
        const updateRes = await tutorService.updateAvatarUrl(uploadRes.data.url);
        if (updateRes.success) {
          toast.success('Avatar updated successfully!');
          fetchProfile();
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCertificateUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setUploadingCertIndex(index);
    try {
      const uploadRes = await tutorService.uploadDocuments([file]);
      if (uploadRes.success && uploadRes.data.files[0]) {
        setValue(`qualifications.${index}.certificate`, uploadRes.data.files[0].url);
        toast.success('Certificate uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed');
    } finally {
      setUploadingCertIndex(null);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        subjects: data.subjects.split(',').map(s => s.trim()).filter(Boolean),
        location: {
          city: data.city,
          area: data.area
        }
      };
      
      const response = await tutorService.updateProfile(payload);
      if (response.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !profile) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Professional <span className="text-primary italic underline decoration-primary/20">Identity</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            {isEditing ? 'Updating your global presence' : 'How students see your professional profile'}
          </p>
        </div>
        <Button 
          variant={isEditing ? "ghost" : "outline"} 
          className={isEditing ? "text-muted-foreground" : "border-primary/20 text-primary hover:bg-primary/10 shadow-sm rounded-xl px-6 h-11"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <><Eye className="mr-2 h-4 w-4" /> View Profile</>
          ) : (
            <><Edit className="mr-2 h-4 w-4" /> Edit Profile</>
          )}
        </Button>
      </div>

      {!isEditing && profile ? (
        /* ================= READABLE VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* View Sidebar */}
          <Card className="md:col-span-1 border-primary/10 overflow-hidden shadow-xl shadow-primary/5 h-fit rounded-3xl sticky top-24">
            <CardContent className="pt-10 text-center space-y-8">
              <div className="relative group mx-auto w-40 h-40">
                <div className="h-40 w-40 rounded-full bg-primary/5 mx-auto border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                  {profile?.user_id?.avatar ? (
                    <img src={profile.user_id.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-20 w-20 text-primary/20" />
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-black text-2xl tracking-tight">{profile?.user_id?.name}</h3>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">{profile?.mode} TUTOR</p>
              </div>
              
              <div className="pt-8 border-t border-dashed space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Reliability</span>
                  <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{profile?.trust_score || 0}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Rating</span>
                  <span className="font-black text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">★ {profile?.average_rating || '0.0'}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-4">
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground font-black uppercase mb-1">Hourly Rate</p>
                    <p className="text-2xl font-black text-primary">${profile?.price_per_hour}<span className="text-xs font-medium text-muted-foreground">/hr</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground font-black uppercase mb-1">Location</p>
                    <p className="text-sm font-bold">{profile?.location?.city}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Main Content */}
          <div className="md:col-span-2 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Briefcase className="h-5 w-5" />
                <h2 className="text-xl font-black tracking-tight">Professional Bio</h2>
              </div>
              <Card className="border-primary/10 shadow-sm rounded-2xl bg-primary/5 border-dashed">
                <CardContent className="p-8">
                  <p className="text-lg text-foreground/80 leading-relaxed font-medium italic">
                    "{profile.bio}"
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="h-5 w-5" />
                <h2 className="text-xl font-black tracking-tight">Expertise & Experience</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {profile.subjects.map(sub => (
                  <Badge key={sub} className="bg-white text-primary border-primary/10 shadow-sm px-4 py-2 rounded-xl text-sm font-bold">
                    {sub}
                  </Badge>
                ))}
                <Badge variant="outline" className="px-4 py-2 rounded-xl text-sm font-bold border-dashed">
                  {profile.experience} Years Experience
                </Badge>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <GraduationCap className="h-5 w-5" />
                <h2 className="text-xl font-black tracking-tight">Academic Qualifications</h2>
              </div>
              <div className="grid gap-4">
                {profile.qualifications.map((qual, idx) => (
                  <div key={idx} className="group flex gap-5 p-6 rounded-2xl bg-white border border-primary/5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <School className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-lg text-foreground">{qual.degree} in {qual.field}</h4>
                        <span className="text-xs font-black text-muted-foreground bg-muted px-2 py-1 rounded-md">{qual.year}</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-1">{qual.institution}</p>
                      {qual.certificate && (
                        <a 
                          href={qual.certificate} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 text-xs font-black text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg"
                        >
                          <FileText className="h-3.5 w-3.5" /> View Proof
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        /* ================= EDITABLE FORM ================= */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form Sidebar */}
            <Card className="md:col-span-1 border-primary/10 overflow-hidden shadow-sm h-fit rounded-3xl">
              <CardContent className="pt-10 text-center space-y-8">
                <div className="relative group mx-auto w-40 h-40">
                  <div className="h-40 w-40 rounded-full bg-primary/5 mx-auto border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                    {profile?.user_id?.avatar ? (
                      <img src={profile.user_id.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 text-primary/20" />
                    )}
                  </div>
                  <label className="absolute bottom-1 right-1 h-12 w-12 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-2xl border-4 border-white group-hover:rotate-12">
                    {uploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-black text-xl tracking-tight">{profile?.user_id?.name}</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{profile?.user_id?.email}</p>
                </div>

                <div className="pt-8 border-t border-dashed space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold uppercase">Trust Metric</span>
                    <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{profile?.trust_score || 0}% Reliability</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold uppercase">Public Rating</span>
                    <span className="font-black text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">★ {profile?.average_rating || '0.0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Main Content */}
            <div className="md:col-span-2 space-y-8">
              <Card className="border-primary/10 shadow-sm rounded-3xl">
                <CardHeader className="bg-muted/30 border-b p-8">
                  <CardTitle className="text-xl font-black">Professional Details</CardTitle>
                  <CardDescription className="font-medium">Define your teaching style and expertise</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-wider text-muted-foreground">Professional Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[180px] p-6 rounded-2xl border-primary/10 border bg-muted/20 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-base leading-relaxed transition-all font-medium"
                      placeholder="Describe your background and teaching philosophy..."
                      {...register('bio')}
                    />
                    {errors.bio && <p className="text-xs font-bold text-destructive mt-1 flex items-center gap-1"><X className="h-3 w-3" /> {errors.bio.message}</p>}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-black uppercase tracking-wider text-muted-foreground">Specialization</Label>
                    <div className="space-y-4">
                      <Select onValueChange={(val: any) => val && addSubject(val as string)}>
                        <SelectTrigger className="h-14 border-primary/10 rounded-2xl bg-muted/20 focus:ring-4 focus:ring-primary/10">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <SelectValue placeholder="Add subjects you specialize in..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl">
                          {STATIC_SUBJECTS.map(subject => (
                            <SelectItem key={subject} value={subject} disabled={currentSubjects.includes(subject)} className="rounded-lg my-1">
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-primary/5 border-2 border-dashed border-primary/10 min-h-[60px]">
                        {currentSubjects.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic px-2 py-1">No specializations added yet</p>
                        ) : (
                          currentSubjects.map(sub => (
                            <Badge key={sub} className="pl-4 pr-1.5 py-2 gap-2 bg-white text-primary hover:bg-primary hover:text-white border-primary/10 shadow-sm transition-all rounded-xl font-bold">
                              {sub}
                              <button type="button" onClick={() => removeSubject(sub)} className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors">
                                <X className="h-4 w-4" />
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-black uppercase tracking-wider text-muted-foreground">Experience</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-4 h-5 w-5 text-primary" />
                        <Input id="experience" type="number" className="pl-12 h-14 rounded-2xl bg-muted/20 border-primary/10 focus:ring-4 focus:ring-primary/10 font-bold" {...register('experience', { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-black uppercase tracking-wider text-muted-foreground">Hourly Rate ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-4 h-5 w-5 text-primary" />
                        <Input id="price_per_hour" type="number" className="pl-12 h-14 rounded-2xl bg-muted/20 border-primary/10 focus:ring-4 focus:ring-primary/10 font-bold" {...register('price_per_hour', { valueAsNumber: true })} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-black uppercase tracking-wider text-muted-foreground">Teaching Mode</Label>
                      <Select defaultValue={profile?.mode} onValueChange={(val: any) => setValue('mode', val)}>
                        <SelectTrigger className="h-14 border-primary/10 rounded-2xl bg-muted/20 focus:ring-4 focus:ring-primary/10">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl">
                          <SelectItem value="ONLINE" className="rounded-lg">Online Sessions Only</SelectItem>
                          <SelectItem value="OFFLINE" className="rounded-lg">In-Person Only</SelectItem>
                          <SelectItem value="BOTH" className="rounded-lg">Hybrid (Both)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-black uppercase tracking-wider text-muted-foreground">Primary City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 h-5 w-5 text-primary" />
                        <Input id="city" className="pl-12 h-14 rounded-2xl bg-muted/20 border-primary/10 focus:ring-4 focus:ring-primary/10 font-bold" placeholder="e.g. London" {...register('city')} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-black uppercase tracking-wider text-muted-foreground">Specific Area</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 h-5 w-5 text-primary/40" />
                        <Input id="area" className="pl-12 h-14 rounded-2xl bg-muted/20 border-primary/10 focus:ring-4 focus:ring-primary/10 font-bold" placeholder="e.g. West End" {...register('area')} />
                      </div>
                    </div>
                  </div>

                  {/* Qualifications Field Array */}
                  <div className="space-y-6 pt-8 border-t border-dashed">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-black tracking-tight">Academic History</h3>
                        <p className="text-xs text-muted-foreground font-medium">Build trust by sharing your credentials</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/5 rounded-xl font-bold" onClick={() => append({ degree: '', field: '', institution: '', year: new Date().getFullYear(), certificate: '' })}>
                        <Plus className="h-4 w-4" /> Add Credential
                      </Button>
                    </div>

                    <div className="grid gap-6">
                      {fields.map((field, index) => (
                        <Card key={field.id} className="border-primary/5 shadow-none bg-primary/5 border-2 border-dashed rounded-2xl group hover:border-primary/20 transition-colors">
                          <CardContent className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3 text-primary">
                                <GraduationCap className="h-5 w-5" />
                                <span className="font-black uppercase tracking-widest text-xs">Credential #{index + 1}</span>
                              </div>
                              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Degree / Title</Label>
                                <Input className="h-12 rounded-xl bg-white border-primary/5" placeholder="e.g. Master of Arts" {...register(`qualifications.${index}.degree` as const)} />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Major / Field</Label>
                                <Input className="h-12 rounded-xl bg-white border-primary/5" placeholder="e.g. Theoretical Physics" {...register(`qualifications.${index}.field` as const)} />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Institution</Label>
                                <div className="relative">
                                  <School className="absolute left-3 top-3.5 h-4 w-4 text-primary/40" />
                                  <Input className="pl-10 h-12 rounded-xl bg-white border-primary/5" placeholder="e.g. Oxford University" {...register(`qualifications.${index}.institution` as const)} />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Completion Year</Label>
                                <Input type="number" className="h-12 rounded-xl bg-white border-primary/5 font-bold" {...register(`qualifications.${index}.year` as const, { valueAsNumber: true })} />
                              </div>
                            </div>

                            <div className="pt-4 border-t border-primary/10">
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                                    <Input className="pl-10 h-10 text-xs rounded-lg bg-white border-primary/5" placeholder="Certificate URL" {...register(`qualifications.${index}.certificate` as const)} />
                                  </div>
                                </div>
                                <label className="h-10 px-4 bg-white text-primary text-xs font-black rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all border border-primary/10 shadow-sm">
                                  {uploadingCertIndex === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-3.5 w-3.5 mr-2" /> Upload Proof</>}
                                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleCertificateUpload(index, e)} disabled={uploadingCertIndex !== null} />
                                </label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-primary/5 flex justify-end gap-4 p-8 border-t rounded-b-3xl">
                  <Button type="button" variant="ghost" className="font-bold rounded-xl" onClick={() => setIsEditing(false)}>Cancel Changes</Button>
                  <Button type="submit" className="h-14 px-10 font-black rounded-2xl shadow-2xl shadow-primary/30 text-lg" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <Save className="mr-3 h-6 w-6" />}
                    Save Identity
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
