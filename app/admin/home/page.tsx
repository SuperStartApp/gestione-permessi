'use client';

import { useRouter } from 'next/navigation';
import { Users, LayoutDashboard, Calendar, BarChart3, ArrowLeft } from 'lucide-react';

export default function AdminHome() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Torre di Controllo',
      description: 'Gestisci le richieste e approva/respingi',
      icon: <LayoutDashboard size={40} />,
      color: 'bg-red-900',
      path: '/admin/dashboard'
    },
    {
      title: 'Gestione Dipendenti',
      description: 'Aggiungi o modifica i collaboratori',
      icon: <Users size={40} />,
      color: 'bg-blue-600',
      path: '/admin'
    },
    {
      title: 'Calendario',
      description: 'Visualizza le assenze nel tempo',
      icon: <Calendar size={40} />,
      color: 'bg-green-600',
      path: '/admin/calendar'
    },
    {
      title: 'Statistiche',
      description: 'Grafici e report sull\'azienda',
      icon: <BarChart3 size={40} />,
      color: 'bg-purple-600',
      path: '/admin/stats'
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-200 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-gray-800">Pannello Admin</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-start p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 text-left group"
            >
              <div className={`${item.color} text-white p-4 rounded-xl mb-6 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h2>
              <p className="text-gray-500">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}