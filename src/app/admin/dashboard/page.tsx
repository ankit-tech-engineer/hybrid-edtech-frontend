'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Star, 
  Loader2, 
  ArrowUpRight, 
  CheckCircle2, 
  UserCheck,
  Activity,
  BarChart3,
  Filter,
  History,
  ShieldAlert,
  Search,
  ChevronRight
} from 'lucide-react';
import { DatePicker, Select as AntSelect } from 'antd';
import dayjs from 'dayjs';
const { RangePicker } = DatePicker;
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import CustomLoader from '@/components/CustomLoader';
import { useLoadingStore } from '@/store/useLoadingStore';

interface DashboardStats {
  total_users: number;
  total_tutors: number;
  total_students: number;
  verified_tutors: number;
  total_bookings: number;
  completed_bookings: number;
  pending_reports: number;
  avg_rating: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  const {loading, setLoading } = useLoadingStore();
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Filters
  const [groupBy, setGroupBy] = useState('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      if (response.success) setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await adminService.getAnalytics({
        group_by: groupBy,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined
      });
      if (response.success) setAnalytics(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchAnalytics()]);
      setLoading(false);
    };
    init();
  }, []);

  // Fetch analytics whenever filters change
  useEffect(() => {
    if (!loading) fetchAnalytics();
  }, [groupBy, dateFrom, dateTo]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      {/* <Loader2 className="h-10 w-10 animate-spin text-primary/60" /> */}
      <CustomLoader />
      {/* <p className="mt-4 text-muted-foreground animate-pulse">Loading intelligence...</p> */}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Admin Overview
          </h1>
          <p className="text-muted-foreground mt-1">Real-time platform metrics and system health</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchAnalytics(); }} className="bg-background/50">
            <Activity className="h-4 w-4 mr-2 text-primary" />
            Refresh Data
          </Button>
          <Link href="/admin/reports">
            <Button size="sm" className="shadow-lg shadow-primary/20">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-90">Total Ecosystem</CardTitle>
            <Users className="h-5 w-5 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats?.total_users || 0}</div>
            <p className="text-xs mt-2 opacity-80 flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              {stats?.total_students || 0} Students active
            </p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Users className="h-24 w-24" />
          </div>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tutor Network</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total_tutors || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-[10px]">
                {stats?.verified_tutors || 0} Verified
              </Badge>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Quality check</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement/Bookings</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total_bookings || 0}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {stats?.completed_bookings || 0} Success rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">User Trust</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.avg_rating || 0}/5</div>
            <p className="text-xs text-muted-foreground mt-2 text-[10px] font-bold uppercase tracking-tight">Average Rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/users" className="group">
              <Card className="hover:border-primary/50 transition-colors bg-gradient-to-br from-background to-muted/20">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base">
                      User Directory <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                    </h3>
                    <p className="text-xs text-muted-foreground">Manage roles & account status</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/verification" className="group">
              <Card className="hover:border-primary/50 transition-colors bg-gradient-to-br from-background to-muted/20">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base">
                      Verifications <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                    </h3>
                    <p className="text-xs text-muted-foreground">Approve new tutor applications</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Performance & Analytics Section */}
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Filter className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider leading-none mb-1">Advanced Filters</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Refine platform intelligence</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {/* <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Aggregation</label>
                  <AntSelect 
                    value={groupBy} 
                    onChange={setGroupBy}
                    className="w-[120px] h-10 font-bold"
                    options={[
                      { value: 'day', label: 'Daily' },
                      { id: 'week', value: 'week', label: 'Weekly' },
                      { id: 'month', value: 'month', label: 'Monthly' },
                    ]}
                  />
                </div> */}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Date Range</label>
                  <RangePicker 
                    className="h-10 rounded-lg border-slate-200 hover:border-indigo-400 transition-colors"
                    onChange={(values) => {
                      if (values) {
                        setDateFrom(values[0]?.format('YYYY-MM-DD') || '');
                        setDateTo(values[1]?.format('YYYY-MM-DD') || '');
                      } else {
                        setDateFrom('');
                        setDateTo('');
                      }
                    }}
                    value={dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : null}
                  />
                </div>

                <div className="flex items-end h-10 pt-5">
                  {(dateFrom || dateTo) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] font-black text-red-400 uppercase hover:text-red-500 hover:bg-red-50"
                      onClick={() => { setDateFrom(''); setDateTo(''); }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">System Intelligence</CardTitle>
                    <CardDescription className="text-slate-400">Activity & Engagement Monitoring</CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Activity Feed */}
                  <div className="p-6 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Growth Trends
                    </h4>
                    {analyticsLoading ? (
                      <div className="h-[240px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-200" /></div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><UserCheck className="h-4 w-4" /></div>
                            <span className="text-sm font-bold text-slate-700">New Registrations</span>
                          </div>
                          <span className="text-lg font-black text-slate-900">
                            {analytics?.registrations?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Calendar className="h-4 w-4" /></div>
                            <span className="text-sm font-bold text-slate-700">Platform Bookings</span>
                          </div>
                          <span className="text-lg font-black text-slate-900">
                            {analytics?.bookings?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><Star className="h-4 w-4" /></div>
                            <span className="text-sm font-bold text-slate-700">Global Reviews</span>
                          </div>
                          <span className="text-lg font-black text-slate-900">
                            {analytics?.reviews?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin Actions */}
                  <div className="p-6 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <History className="h-4 w-4" /> Moderator Actions
                    </h4>
                    {analyticsLoading ? (
                      <div className="h-[240px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-200" /></div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {analytics?.admin_actions?.map((action: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-slate-200 transition-all">
                             <div className="flex items-center gap-3 min-w-0">
                               <div className={`h-2 w-2 rounded-full ${
                                 action._id.includes('APPROVED') ? 'bg-green-500' :
                                 action._id.includes('REJECTED') ? 'bg-red-500' :
                                 action._id.includes('BLOCKED') ? 'bg-orange-500' : 'bg-indigo-500'
                               }`} />
                               <span className="text-[10px] font-bold text-slate-600 truncate uppercase tracking-tighter">
                                 {action._id.replace(/_/g, ' ')}
                               </span>
                             </div>
                             <Badge variant="outline" className="font-black text-slate-900 bg-slate-50 border-none px-2 h-6">
                               {action.count}
                             </Badge>
                          </div>
                        ))}
                        {(!analytics?.admin_actions || analytics.admin_actions.length === 0) && (
                          <div className="py-12 text-center text-slate-300 italic text-xs">No moderator logs in this period</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Systems Status Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    Engine Status: Optimal
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Data Range: {analytics?.date_range?.from ? new Date(analytics.date_range.from).toLocaleDateString() : 'Real-time'} 
                    {analytics?.date_range?.to && ` — ${new Date(analytics.date_range.to).toLocaleDateString()}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar area */}
        <div className="space-y-8">
          <Card className="shadow-lg border-t-4 border-t-destructive rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Safety & Reports</CardTitle>
                <Badge variant="destructive" className="animate-pulse shadow-sm">
                  {stats?.pending_reports || 0} Active
                </Badge>
              </div>
              <CardDescription className="text-xs">Moderation tasks requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.pending_reports ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                      <p className="text-xs font-bold text-destructive uppercase tracking-tight">Immediate Action</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Platform security detected unresolved disputes in the verification queue.</p>
                  </div>
                  <Link href="/admin/reports" className="block">
                    <Button variant="outline" size="sm" className="w-full font-bold rounded-xl h-10 border-destructive/20 hover:bg-destructive/5 hover:text-destructive">
                      Resolve Issues
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-20 text-green-500" />
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">Queue Clear</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl overflow-hidden border-none bg-slate-50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Tutor Quality</CardTitle>
                <Users className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-3">
                <div className="space-y-0.5">
                  <span className="text-3xl font-black text-slate-900">
                    {stats?.total_tutors ? Math.round((stats.verified_tutors / stats.total_tutors) * 100) : 0}%
                  </span>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Approval Rate</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">Target</span>
                  <span className="text-xs font-bold text-green-600">85%</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000 ease-out shadow-lg" 
                  style={{ width: `${stats?.total_tutors ? (stats.verified_tutors / stats.total_tutors) * 100 : 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
