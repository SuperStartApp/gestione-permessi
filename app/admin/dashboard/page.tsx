'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Copy, Link as LinkIcon, Trash2 } from 'lucide-react';

type Employee = { id: string; nome: string; cognome: string; ruolo: string; telefono: string; pin: string; unique_token: string; };

export default function AdminPage() {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [ruolo, setRuolo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => { fetchEmployees(); },[]);

  async function fetchEmployees() {
    const { data } = await supabase.from('tbper_employees').select('*').order('nome', { ascending: true });
    setEmployees(data ||[]);
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('tbper_employees').insert([{
      nome, cognome, ruolo, telefono,
      pin: Math.floor(100000 + Math.random() * 900000).toString(),
      unique_token: Math.random().toString(36).substring(2, 15)
    }]);
    if (!error) { 
        setNome(''); setCognome(''); setRuolo(''); setTelefono(''); 
        fetchEmployees(); 
    }
  };

  const deleteEmployee = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo dipendente?')) {
        await supabase.from('tbper_employees').delete().eq('id', id);
        fetchEmployees();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* TITOLO PULITO - L'HEADER È GESTITO DAL LAYOUT GLOBALE */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestione Dipendenti</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border-t-4 border-red-900">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><UserPlus /> Nuovo Dipendente</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-2 border rounded" required />
            <input type="text" placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} className="w-full p-2 border rounded" required />
            <input type="text" placeholder="Ruolo" value={ruolo} onChange={(e) => setRuolo(e.target.value)} className="w-full p-2 border rounded" required />
            <input type="text" placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full p-2 border rounded" required />
            <button type="submit" className="w-full bg-red-900 text-white py-2 rounded hover:bg-red-800 transition">Genera Accesso</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Dipendente</th>
                <th className="p-4">PIN</th>
                <th className="p-4 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-bold">{emp.nome} {emp.cognome} <br/><span className="text-xs text-gray-500 font-normal">{emp.ruolo}</span></td>
                  <td className="p-4 font-mono font-bold text-yellow-700">{emp.pin}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/access/${emp.unique_token}`)} className="text-blue-600 p-2 hover:bg-blue-50 rounded" title="Copia Link"><LinkIcon size={18} /></button>
                    <button onClick={() => deleteEmployee(emp.id)} className="text-red-600 p-2 hover:bg-red-50 rounded" title="Elimina"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}