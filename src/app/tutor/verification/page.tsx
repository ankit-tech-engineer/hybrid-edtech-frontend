'use client';

import { useState, useEffect } from 'react';
import { tutorService } from '@/services/tutor.service';
import { TutorProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldCheck, ShieldAlert, FileText, Upload, CheckCircle2, Loader2, AlertCircle, Clock, Trash2, Eye, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLoadingStore } from '@/store/useLoadingStore';

interface VerificationFormData {
  id_type: string;
  id_number: string;
  documents: string[];
}

export default function VerificationPage() {
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const { loading, setLoading } = useLoadingStore();
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [formData, setFormData] = useState<VerificationFormData>({
    id_type: 'AADHAAR',
    id_number: '',
    documents: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, detailsRes] = await Promise.all([
        tutorService.getProfile(),
        tutorService.getVerificationDetails()
      ]);

      if (profileRes.success) setProfile(profileRes.data);
      if (detailsRes.success) {
        setVerificationDetails(detailsRes.data);
        // If not submitted, default to editing
        if (!detailsRes.data.submitted) {
          setIsEditing(true);
        }
      } else if (!profileRes.data.verification_status) {
        setIsEditing(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_number || formData.documents.length === 0) {
      toast.error('Please fill all fields and upload at least one document.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await tutorService.submitVerification(formData);
      if (response.success) {
        toast.success('Verification request submitted successfully!');
        setIsEditing(false);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.message || (typeof error === 'string' ? error : null) || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.documents.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 documents.');
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
    }

    setUploadingDocs(true);
    try {
      const response = await tutorService.uploadDocuments(files);
      if (response.success) {
        const newDocUrls = response.data.files.map(f => f.url);
        setFormData(prev => ({ 
          ...prev, 
          documents: [...prev.documents, ...newDocUrls] 
        }));
        toast.success(`${files.length} document(s) uploaded successfully!`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Document upload failed');
    } finally {
      setUploadingDocs(false);
      // Reset input value to allow re-uploading the same file if needed
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const currentStatus = verificationDetails?.status || profile?.verification_status;
  const isPending = currentStatus === 'PENDING';
  const isApproved = currentStatus === 'APPROVED';
  const isRejected = currentStatus === 'REJECTED';

  if (loading && !profile) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Verification <span className="text-primary italic underline decoration-primary/20">Center</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            {isEditing ? 'Updating your identity dossier' : 'Review your current verification status'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
          disabled={isApproved}  
            variant={isEditing ? "ghost" : "outline"} 
            className={isEditing ? "text-muted-foreground" : "border-primary/20 text-primary hover:bg-primary/10 shadow-sm rounded-xl px-6 h-11 font-black"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <><Eye className="mr-2 h-4 w-4" /> View Status</>
            ) : (
              <><Edit className="mr-2 h-4 w-4" /> Edit Details</>
            )}
          </Button>
          <ShieldCheck className="h-10 w-10 text-primary/20 hidden md:block" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Status Card - Always visible as summary */}
        <Card className={`border-none shadow-2xl text-white overflow-hidden rounded-3xl transition-all duration-500 ${
          isApproved ? 'bg-green-600' : isRejected ? 'bg-red-600' : isPending ? 'bg-yellow-600' : 'bg-slate-900'
        }`}>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
               <ShieldCheck className="h-64 w-64 text-white" />
            </div>
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
              {isApproved ? <CheckCircle2 className="h-12 w-12" /> : isRejected ? <ShieldAlert className="h-12 w-12" /> : <Clock className="h-12 w-12" />}
            </div>
            <div className="flex-1 text-center md:text-left space-y-3 z-10">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 <h2 className="text-3xl font-black">Status: {currentStatus || 'NOT SUBMITTED'}</h2>
                 {currentStatus && (
                   <Badge className="bg-white/30 text-white border-none font-black backdrop-blur-sm uppercase tracking-widest text-[10px]">Active Track</Badge>
                 )}
              </div>
              <p className="text-lg opacity-90 leading-relaxed font-medium max-w-xl">
                {isApproved && "Congratulations! Your profile is verified and visible to students with a 'Verified' badge. Your trust score has been boosted."}
                {isPending && "Your documents are currently under review by our compliance team. This usually takes 24-48 hours. Please check back later."}
                {isRejected && "Unfortunately, your verification was rejected due to inconsistent documentation. Please edit your details and re-submit."}
                {!currentStatus && "You haven't submitted your identity proof yet. Please complete this step to unlock all platform features."}
              </p>
            </div>
          </CardContent>
        </Card>

        {!isEditing && verificationDetails?.submitted ? (
          /* ================= READABLE VIEW ================= */
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-primary/10 shadow-sm rounded-3xl">
                <CardHeader className="px-8 py-2">
                  <CardTitle className="text-xl font-black">Identity Details</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pt-0 space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Document Type</p>
                    <p className="text-lg font-bold text-foreground">{verificationDetails.details?.id_type || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID Number</p>
                    <p className="text-lg font-bold text-foreground tracking-widest">
                      {verificationDetails.details?.id_number || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 shadow-sm rounded-3xl bg-primary/5 border-dashed">
                <CardHeader className="px-8 py-2">
                  <CardTitle className="text-xl font-black">Dossier Summary</CardTitle>
                </CardHeader>
                <CardContent className="px-8 py-4 space-y-4">
                   <div className="flex items-center gap-3">
                     <FileText className="h-5 w-5 text-primary" />
                     <p className="font-bold">{verificationDetails.details?.documents?.length || 0} Documents Uploaded</p>
                   </div>
                   <p className="text-xs text-muted-foreground font-medium">Your identity documents are stored securely in our encrypted vault.</p>
                </CardContent>
              </Card>
            </div>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                <h2 className="text-xl font-black tracking-tight uppercase">Uploaded Assets</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(verificationDetails.details?.documents || []).map((doc: string, idx: number) => (
                  <div key={idx} className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-primary/5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-black truncate">{doc.split('/').pop()}</p>
                      <a href={doc} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest mt-1 inline-block">View Document</a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* ================= EDITABLE FORM ================= */
          <Card className="border-primary/10 shadow-2xl overflow-hidden rounded-[2.5rem] animate-in zoom-in-95 duration-500">
            <CardHeader className="bg-muted/30 border-b p-10">
              <CardTitle className="text-2xl font-black">Identity Submission</CardTitle>
              <CardDescription className="text-base font-medium mt-1">Upload a valid government-issued ID for professional verification</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="id_type">ID Type</Label>
                    <Select value={formData.id_type || ''} onValueChange={(val) => setFormData({ ...formData, id_type: val || '' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AADHAAR">Aadhaar Card</SelectItem>
                        <SelectItem value="PAN">PAN Card</SelectItem>
                        <SelectItem value="PASSPORT">Passport</SelectItem>
                        <SelectItem value="VOTER_ID">Voter ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_number">ID Number</Label>
                    <Input 
                      id="id_number" 
                      placeholder="Enter your ID number" 
                      value={formData.id_number}
                      onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-black">ID Verification Documents</Label>
                    <label className={`h-11 px-6 bg-primary text-white text-sm font-black rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-xl shadow-primary/20 ${uploadingDocs ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploadingDocs ? (
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading...</>
                      ) : (
                        <><Upload className="h-5 w-5 mr-2" /> Upload Identity Proof</>
                      )}
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        accept="image/*,.pdf" 
                        onChange={handleFileUpload} 
                        disabled={uploadingDocs} 
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-primary/5 rounded-3xl p-8 border-2 border-dashed border-primary/10 text-center min-h-[200px] flex flex-col items-center justify-center space-y-4">
                      {formData.documents.length === 0 ? (
                        <>
                          <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                            <Upload className="h-8 w-8 text-primary/40" />
                          </div>
                          <div>
                            <p className="font-black text-foreground">No documents attached</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Upload both sides of your ID (Max 5 files)</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                          {formData.documents.map((doc, idx) => (
                            <div key={idx} className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-primary/5 hover:border-primary/20 transition-all shadow-sm">
                              <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-xs font-black truncate max-w-[150px]">{doc.split('/').pop()}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verified Link</p>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" 
                                onClick={() => removeDocument(idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100/50 p-5 rounded-2xl flex gap-4">
                       <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                       <div className="space-y-1">
                         <p className="text-sm font-black text-blue-900">Security & Privacy</p>
                         <p className="text-xs text-blue-700 leading-relaxed font-medium">
                           Your documents are encrypted and only accessible by authorized administrators. We do not share your private data with anyone.
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 p-8 border-t justify-end rounded-b-3xl">
                <Button type="submit" disabled={submitting || uploadingDocs} className="px-10 h-14 font-black rounded-2xl shadow-2xl shadow-primary/30 text-lg">
                  {submitting ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <ShieldCheck className="mr-3 h-6 w-6" />}
                  Submit Identity
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
