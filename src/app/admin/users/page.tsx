'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle2, 
  UserCog, 
  Mail, 
  Phone, 
  Loader2, 
  ShieldCheck, 
  Filter,
  MoreVertical,
  Activity,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useLoadingStore } from '@/store/useLoadingStore';

interface UserMeta {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  unverified_users: number;
  by_role: {
    students: number;
    tutors: number;
    admins: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  // const [loading, setLoading] = useState(true);
  const {loading, setLoading } = useLoadingStore();
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState<UserMeta | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });

  const fetchUsers = async (page = 1, currentSearch = search) => {
    // Only show full-screen loader on initial fetch
    if (users.length === 0) setLoading(true);
    
    try {
      const response = await adminService.getUsers({ 
        page, 
        search: currentSearch || undefined,
        limit: 20 
      });
      
      if (response.success) {
        setUsers(response.data.users || []);
        setPagination(response.data.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
        setMeta(response.data.meta || null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Server-side Search with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Don't fetch on initial mount (handled by first useEffect)
      if (search !== undefined) {
        fetchUsers(1, search);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await adminService.toggleUserStatus(id, !currentStatus);
      if (response.success) {
        toast.success(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchUsers(pagination.page);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update user status');
    }
  };

  // if (loading) return (
  //   <div className="flex flex-col items-center justify-center min-h-[80vh]">
  //     <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
  //     <p className="mt-4 text-muted-foreground animate-pulse font-medium tracking-tight">Accessing user directory...</p>
  //   </div>
  // );

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
             <UserCog className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-1">Control access, manage roles, and monitor status</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10 h-11 bg-card border-none shadow-sm focus-visible:ring-primary/20" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Condensed Horizontal Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {[
          { label: 'Total', value: meta?.total_users || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Active', value: meta?.active_users || 0, icon: Activity, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Inactive', value: meta?.inactive_users || 0, icon: Ban, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          { label: 'Verified', value: meta?.verified_users || 0, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Pending', value: meta?.unverified_users || 0, icon: Search, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Tutors', value: meta?.by_role?.tutors || 0, icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
          { label: 'Students', value: meta?.by_role?.students || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map((item, idx) => (
          <Card key={idx} className={`border ${item.border} shadow-sm hover:shadow-md transition-all group cursor-default bg-white/50 backdrop-blur-sm`}>
            <CardContent className="px-3 flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shadow-sm shrink-0`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-tight text-slate-400 truncate leading-none mb-0.5">{item.label}</p>
                <p className="text-lg font-black text-slate-900 tracking-tighter leading-none">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table Card */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-900 pl-6">Profile</TableHead>
                <TableHead className="font-bold text-slate-900">Communication</TableHead>
                <TableHead className="font-bold text-slate-900">Permissions</TableHead>
                <TableHead className="font-bold text-slate-900">Account Status</TableHead>
                <TableHead className="text-right font-bold text-slate-900 pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="max-w-xs mx-auto opacity-40">
                      <Search className="h-12 w-12 mx-auto mb-4" />
                      <p className="font-bold text-lg">No Results Found</p>
                      <p className="text-sm">Try adjusting your search filters to find what you're looking for.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="py-5 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary shadow-sm border border-white">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 flex items-center gap-2">
                            {user.name}
                            {(user as any).is_verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-50" />}
                          </p>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
                            Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <div className="p-1 rounded-md bg-slate-100"><Mail className="h-3 w-3" /></div>
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <div className="p-1 rounded-md bg-slate-100"><Phone className="h-3 w-3" /></div>
                          {user.phone || 'No phone added'}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-5">
                      <Badge variant="outline" className={`font-bold border-none shadow-sm ${
                        user.role === 'ADMIN' ? 'text-purple-700 bg-purple-100' :
                        user.role === 'TUTOR' ? 'text-indigo-700 bg-indigo-100' :
                        'text-emerald-700 bg-emerald-100'
                      }`}>
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-5">
                      {user.is_active ? (
                        <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wider">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                          Live
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          Suspended
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right py-5 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant={user.is_active ? "ghost" : "outline"}
                          className={`rounded-xl h-9 px-4 font-bold transition-all ${
                            user.is_active 
                            ? "text-red-500 hover:bg-red-50 hover:text-red-600" 
                            : "text-green-600 border-green-200 bg-green-50/50 hover:bg-green-100"
                          }`}
                          onClick={() => handleToggleStatus(user._id, user.is_active)}
                        >
                          {user.is_active ? (
                            <><Ban className="h-3.5 w-3.5 mr-2" /> Deactivate</>
                          ) : (
                            <><CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Activate</>
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-slate-900 rounded-xl">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Showing {users.length} of {pagination.total} users
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg h-8 px-4 font-bold" 
                disabled={pagination.page === 1}
                onClick={() => fetchUsers(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg h-8 px-4 font-bold" 
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchUsers(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
