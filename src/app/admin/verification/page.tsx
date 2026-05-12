'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Loader2, 
  User, 
  Mail, 
  Fingerprint, 
  Search,
  Eye,
  Clock,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useLoadingStore } from '@/store/useLoadingStore';

interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

interface Verification {
  _id: string;
  user_id: PopulatedUser;
  id_type: string;
  id_number: string;
  documents: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminVerificationPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  // const [loading, setLoading] = useState(true);
  const {loading, setLoading } = useLoadingStore();
  const [selectedVerif, setSelectedVerif] = useState<Verification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPendingVerifications();
      if (response.success) {
        // Handle the nested structure { verifications: [...], pagination: {...} }
        setVerifications(response.data.verifications || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedVerif) return;
    setActionLoading(true);
    try {
      const response = await adminService.updateVerificationStatus(selectedVerif._id, status);
      if (response.success) {
        toast.success(`Verification ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
        setModalOpen(false);
        fetchVerifications();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      <p className="mt-4 text-muted-foreground animate-pulse font-medium">Validating tutor identities...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
             <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">KYC Verification</h1>
            <p className="text-muted-foreground mt-1">Audit and approve tutor credentials</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchVerifications}>Refresh</Button>
          <Badge variant="outline" className="px-3 py-1 font-bold text-indigo-600 border-indigo-200 bg-indigo-50/50 tracking-wider text-[10px]">
            {verifications.length} PENDING AUDITS
          </Badge>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-900 pl-6">Applicant</TableHead>
                <TableHead className="font-bold text-slate-900">Credential Type</TableHead>
                <TableHead className="font-bold text-slate-900">Identification</TableHead>
                <TableHead className="font-bold text-slate-900">Attachments</TableHead>
                <TableHead className="text-right font-bold text-slate-900 pr-6">Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="max-w-xs mx-auto opacity-40">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="font-bold text-lg">Queue Empty</p>
                      <p className="text-sm">All tutor verifications are currently up to date.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                verifications.map((verif) => (
                  <TableRow key={verif._id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="py-5 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center font-black text-indigo-600 shadow-sm border border-white">
                          {verif.user_id?.name?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 leading-none mb-1">{verif.user_id?.name}</p>
                          <p className="text-[11px] font-medium text-muted-foreground tracking-tight flex items-center gap-1">
                            <Mail className="h-2.5 w-2.5" />
                            {verif.user_id?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-5">
                      <Badge variant="outline" className="font-bold border-indigo-100 bg-indigo-50 text-indigo-700">
                        {verif.id_type}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-5">
                      <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-600">
                        <Fingerprint className="h-3.5 w-3.5 opacity-40" />
                        {verif.id_number}
                      </div>
                    </TableCell>

                    <TableCell className="py-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <FileText className="h-4 w-4 text-indigo-400" />
                        {verif.documents?.length || 0} Assets
                      </div>
                    </TableCell>

                    <TableCell className="text-right py-5 pr-6">
                      <Button 
                        size="sm" 
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all group-hover:scale-105"
                        onClick={() => {
                          setSelectedVerif(verif);
                          setModalOpen(true);
                        }}
                      >
                        Auditing <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] sm:rounded-3xl bg-white">
          {/* Enhanced Glassy Header - Responsive */}
          <div className="relative bg-slate-900 px-6 py-2 sm:px-8 sm:py-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none"></div>
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl shrink-0">
                  <ShieldCheck className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">Identity Audit</DialogTitle>
                  <DialogDescription className="text-indigo-200/70 font-medium text-xs sm:text-base mt-0.5 sm:mt-1">
                    Verifying credentials for <span className="text-white font-bold">{selectedVerif?.user_id?.name}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {selectedVerif && (
            <div className="p-6 sm:p-4 lg:p-6 space-y-8 sm:space-y-10 max-h-[50vh] sm:max-h-[50vh] overflow-y-auto custom-scrollbar">
              {/* Applicant Info Section - Refined Grid */}
              <section className="space-y-4 sm:space-y-6">
                <h4 className="text-[10px] font-black tracking-[0.2em] text-indigo-600/60 flex items-center gap-2">
                  <User className="h-3 w-3" /> Profile Details
                </h4>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {[
                    { label: 'Legal Name', val: selectedVerif.user_id?.name, icon: User, color: 'text-slate-900' },
                    { label: 'Official Email', val: selectedVerif.user_id?.email, icon: Mail, color: 'text-slate-600' },
                    { label: 'ID Category', val: selectedVerif.id_type, icon: ShieldCheck, color: 'text-indigo-700' },
                    { label: 'ID Number', val: selectedVerif.id_number, icon: Fingerprint, color: 'text-slate-900 font-mono' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1 group min-w-0">
                      <p className="text-[10px] text-muted-foreground font-bold tracking-wider flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        {item.label}
                      </p>
                      <p className={`text-xs sm:text-sm font-bold ${item.color} truncate`} title={item.val}>
                        {item.val}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Document Gallery - Premium Cards */}
              <section className="space-y-4 sm:space-y-6">
                 <h4 className="text-[10px] font-black tracking-[0.2em] text-indigo-600/60 flex items-center gap-2">
                   <FileText className="h-3 w-3" /> Verification Assets
                 </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                   {selectedVerif.documents?.map((doc: string, i: number) => (
                     <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-50 border border-slate-100 transition-all hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10">
                       <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-500">
                             <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 tracking-widest group-hover:text-indigo-600 transition-colors">
                            Asset_{i+1}.pdf
                          </span>
                       </div>
                       
                       <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                          <a 
                            href={doc} 
                            target="_blank" 
                            className="bg-white text-slate-900 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" /> View
                          </a>
                       </div>
                       
                       <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                         <Badge className="bg-white/80 backdrop-blur-md text-slate-900 border-none shadow-sm font-bold text-[9px] sm:text-[10px] px-1.5 h-4 sm:px-2 sm:h-5">
                           FILE {i+1}
                         </Badge>
                       </div>
                     </div>
                   ))}
                 </div>
              </section>

              {/* Enhanced Auditor Guidance */}
              <div className="p-4 sm:p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex gap-3 sm:gap-5 items-start">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0 border border-indigo-100">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs font-black text-indigo-900 tracking-wider">Compliance Checklist</p>
                  <p className="text-[10px] sm:text-xs text-indigo-700/80 leading-relaxed font-medium">
                    Ensure legal name matches ID exactly. Documents must be clear and unexpired.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer - Responsive Stacking */}
          <div className="p-2 sm:p-4 bg-slate-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-black tracking-widest leading-none mb-1">Submitted On</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {selectedVerif ? new Date(selectedVerif.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-red-100 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 font-bold rounded-xl sm:rounded-2xl h-12 sm:h-14 px-6 sm:px-8 transition-all order-2 sm:order-1" 
                onClick={() => handleUpdateStatus('REJECTED')} 
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Reject
              </Button>
              <Button 
                className="w-full sm:w-auto bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl sm:rounded-2xl h-12 sm:h-14 px-8 sm:px-10 shadow-xl sm:shadow-2xl shadow-indigo-200 transition-all active:scale-95 order-1 sm:order-2" 
                onClick={() => handleUpdateStatus('APPROVED')} 
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Approve</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
