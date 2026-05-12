'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Calendar, 
  Loader2, 
  ExternalLink, 
  Clock, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useLoadingStore } from '@/store/useLoadingStore';

interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

interface PopulatedBooking {
  _id: string;
  mode: string;
  date_time: string;
}

interface PopulatedReport {
  _id: string;
  reporter_id: PopulatedUser;
  reported_user_id: PopulatedUser;
  booking_id: PopulatedBooking;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<PopulatedReport[]>([]);
  // const [loading, setLoading] = useState(true);
  const {loading, setLoading } = useLoadingStore();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminService.getReports();
      if (response.success) {
        // The API returns { reports: [...], pagination: {...} }
        setReports(response?.data?.reports || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const response = await adminService.resolveReport(id);
      if (response.success) {
        toast.success('Report marked as resolved');
        fetchReports();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to resolve report');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Loader2 className="h-10 w-10 animate-spin text-destructive/40" />
      <p className="mt-4 text-muted-foreground animate-pulse font-medium">Scanning for violations...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shadow-sm">
             <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Trust & Safety</h1>
            <p className="text-muted-foreground mt-1">Review and moderate platform disputes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchReports}>
            Refresh
          </Button>
          <Badge variant="outline" className="px-3 py-1 font-bold text-destructive border-destructive/20 bg-destructive/5">
            {reports.filter(r => r.status === 'OPEN').length} OPEN ISSUES
          </Badge>
        </div>
      </div>

      {/* Reports Table Card */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px] font-bold text-slate-900">Reporter</TableHead>
                <TableHead className="w-[200px] font-bold text-slate-900">Accused Party</TableHead>
                <TableHead className="font-bold text-slate-900">Issue Context</TableHead>
                <TableHead className="w-[120px] font-bold text-slate-900">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-900 pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="max-w-xs mx-auto opacity-40">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="font-bold text-lg">No Active Reports</p>
                      <p className="text-sm">The platform is running smoothly with no reported disputes.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report._id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="align-top py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          {report.reporter_id?.name}
                          <Badge variant="outline" className="text-[10px] h-4 py-0 font-normal">Student</Badge>
                        </span>
                        <span className="text-xs text-muted-foreground truncate">{report.reporter_id?.email}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="align-top py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          {report.reported_user_id?.name}
                          <Badge variant="outline" className="text-[10px] h-4 py-0 font-normal border-indigo-200 text-indigo-700">Tutor</Badge>
                        </span>
                        <span className="text-xs text-muted-foreground truncate">{report.reported_user_id?.email}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-6">
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 relative group-hover:bg-white group-hover:border-slate-200 transition-all">
                          <p className="text-sm text-slate-700 leading-relaxed italic">
                            &ldquo;{report.reason}&rdquo;
                          </p>
                        </div>
                        <div className="flex items-center flex-wrap gap-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {report.booking_id && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-200/50 text-slate-600">
                              <ExternalLink className="h-3 w-3" />
                              {report.booking_id.mode} SESSION
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-6">
                      <Badge 
                        className={`font-bold shadow-sm ${
                          report.status === 'RESOLVED' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : 'bg-red-50 text-red-600 hover:bg-red-50 border border-red-200'
                        }`}
                      >
                        {report.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right align-top py-6 pr-6">
                      {report.status === 'OPEN' ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleResolve(report._id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg"
                        >
                          Resolve <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <div className="flex justify-end text-green-600">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                      )}
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
