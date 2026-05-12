'use client';

import { useLoadingStore } from '@/store/useLoadingStore';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CustomLoader() {
  const { loading } = useLoadingStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (loading) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 500); // Smooth exit
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ${
      loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl" />
      
      {/* Loader Container */}
      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin shadow-lg shadow-indigo-200/50" />
          <div className="absolute inset-4 border-2 border-b-violet-500 rounded-full animate-spin-slow opacity-60" />
          
          {/* Central Icon */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 h-10 w-10 rounded-xl flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-white font-black text-xl italic tracking-tighter">H</span>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
            Hybrid EdTech
          </h2>
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <Loader2 className="h-3 w-3 animate-spin" />
            Initializing Intelligence
          </div>
        </div>

        {/* Progress Bar (Visual only for feel) */}
        <div className="mt-8 w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-600 to-indigo-500 w-full animate-loader-progress shadow-lg" />
        </div>
      </div>
    </div>
  );
}
