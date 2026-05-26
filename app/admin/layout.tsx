'use client';

import React from 'react';
import { LayoutDashboard, Users, Calendar, BarChart3, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/admin/home' },
    { name: 'Torre Controllo', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Dipendenti', icon: <Users size={20} />, path: '/admin' },
    { name: 'Calendario', icon: <Calendar size={20} />, path: '/admin/calendar' },
    { name: 'Statistiche', icon: <BarChart3 size={20} />, path: '/admin/stats' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-red-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white text-red-900 font-bold p-1 rounded">T</div>
            <span className="font-bold text-lg hidden sm:inline">Todde Bus Admin</span>
          </div>
          <nav className="flex gap-1 md:gap-4">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs md:text-sm transition-colors ${
                  pathname === item.path ? 'bg-red-800 text-white shadow-inner' : 'text-red-100 hover:bg-red-800'
                }`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}