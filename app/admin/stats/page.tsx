'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  BarChart3,
  ClipboardList 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- COMPONENTE PER LE CARD DELLE STATISTICHE ---
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4">
      <div className={`${color} text-white p-3 rounded-xl shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

// --- PAGINA STATISTICHE ---
export default function AdminStats() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    total: 0, pending: 0, approved: 0, rejected: 0,
    types: [], statusDistribution: [], monthlyTrend: []
  });
  const [loading, setLoading] = useState(true);

  const COLORS =['#7f1d1d', '#2563eb', '#eab308', '#ef4444', '#22c55e', '#a855f7'];

  useEffect(() => {
    fetchStats();
  },[]);

  async function fetchStats() {
    setLoading(true);
    const { data: requests, error } = await supabase.from('tbper_requests').select(`*, tbper_employees(nome)`);

    if (error) {
      console.error("Errore:", error);
      setLoading(false);
      return;
    }

    if (!requests || requests.length === 0) {
      setLoading(false);
      return;
    }

    // Calcolo Dati
    const total = requests.length;
    const pending = requests.filter(r => r.stato === 'DA APPROVARE').length;
    const approved = requests.filter(r => r.stato === 'APPROVATA').length;
    const rejected = requests.filter(r => r.stato === 'RESPINTA').length;

    // Distribuzione per Tipo
    const typeMap: Record<string, number> = {};
    requests.forEach(r => { typeMap[r.tipo_richiesta] = (typeMap[r.tipo_richiesta] || 0) + 1; });
    const typesData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    // Distribuzione per Stato
    const statusData =[
      { name: 'DA APPROVARE', value: pending },
      { name: 'APPROVATA', value: approved },
      { name: 'RESPINTA', value: rejected }
    ];

    setStats({ total, pending, approved, rejected, types: typesData, statusDistribution: statusData });
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/admin/home')} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft size={24} /></button>
          <h1 className="text-3xl font-bold">Analisi Business</h1>
        </div>

        {loading ? <p>Caricamento...</p> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="Totale" value={stats.total} icon={<ClipboardList size={24}/>} color="bg-blue-600" />
              <StatCard title="In Attesa" value={stats.pending} icon={<Clock size={24}/>} color="bg-yellow-500" />
              <StatCard title="Approvate" value={stats.approved} icon={<CheckCircle2 size={24}/>} color="bg-green-500" />
              <StatCard title="Respinte" value={stats.rejected} icon={<AlertCircle size={24}/>} color="bg-red-500" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-bold mb-4">Distribuzione per Tipo</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.types} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                        {stats.types.map((entry: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-bold mb-4">Stato delle Pratiche</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.statusDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#7f1d1d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}