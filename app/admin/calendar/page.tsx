'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale'; // Per avere i mesi in Italiano
import { ChevronLeft, ChevronRight, LayoutDashboard, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminCalendar() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Colori per tipo di richiesta
  const typeColors: Record<string, string> = {
    'FERIE': 'bg-blue-500',
    'PERMESSO': 'bg-yellow-500',
    'MALATTIA': 'bg-red-500',
    'CONGEDO': 'bg-green-500',
    'LUTTO': 'bg-purple-500',
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    const { data } = await supabase
      .from('tbper_requests')
      .select(`*, tbper_employees (nome, cognome)`)
      .eq('stato', 'APPROVATA'); // Vediamo solo quelle approvate nel calendario
    setRequests(data || []);
    setLoading(false);
  }

  // Logica per generare i giorni del calendario
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Inizia da Lunedì
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Funzione per trovare le richieste che coprono un determinato giorno
  const getRequestsForDay = (day: Date) => {
    return requests.filter(req => {
      const start = new Date(req.data_inizio);
      const end = new Date(req.data_fine);
      return isWithinInterval(day, { start, end });
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin')} className="p-2 hover:bg-red-100 text-red-900 rounded-full transition">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="text-red-900" /> Calendario Assenze
              </h1>
              <p className="text-gray-600">Visualizzazione pianificazione approvata</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition"><ChevronLeft /></button>
            <span className="text-lg font-bold text-gray-700 min-w-[150px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: it })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition"><ChevronRight /></button>
          </div>
        </div>

        {/* LEGENDA */}
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm text-sm">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`}></div>
              <span className="text-gray-600">{type}</span>
            </div>
          ))}
        </div>

        {/* GRIGLIA CALENDARIO */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Giorni della settimana */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Giorni del mese */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === monthStart.getMonth();
              const dayRequests = getRequestsForDay(day);

              return (
                <div 
                  key={idx} 
                  className={`min-h-[120px] p-2 border-r border-b transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-300' : 'bg-white text-gray-700'
                  } ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isSameDay(day, new Date()) ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayRequests.map((req, rIdx) => (
                      <div 
                        key={rIdx}
                        className={`text-[10px] p-1 rounded truncate text-white font-medium shadow-sm ${typeColors[req.tipo_richiesta] || 'bg-gray-500'}`}
                        title={`${req.tbper_employees?.nome} ${req.tbper_employees?.cognome}: ${req.tipo_richiesta}`}
                      >
                        {req.tbper_employees?.nome} ({req.tipo_richiesta})
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {loading && <p className="text-center mt-10 text-gray-500">Caricamento calendario...</p>}
      </div>
    </main>
  );
}