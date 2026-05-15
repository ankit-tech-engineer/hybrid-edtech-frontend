'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User, LayoutDashboard, Calendar, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout, role, refreshToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <GraduationCap className="h-8 w-8" />
            <span>HybridTutor</span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/tutors" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <Search className="h-4 w-4" />
            Find Tutors
          </Link>

          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-4">
              {role === 'STUDENT' && (
                <Link href="/bookings" className="text-sm font-medium hover:text-primary flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  My Bookings
                </Link>
              )}
              {role === 'TUTOR' && (
                <Link href="/tutor/dashboard" className="text-sm font-medium hover:text-primary flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              {role === 'ADMIN' && (
                <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
              
              <div className="flex items-center gap-2 pl-4 border-l">
                <span className="text-sm font-medium hidden md:inline-block">
                  {user?.name}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
