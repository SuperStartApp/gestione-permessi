'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Send, ClipboardList, Clock, FileText, CheckCircle2, XCircle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type RequestType = 'FERIE' | 'PERMESSO' | 'MALATTIA' | 'CONGEDO' | 'LUTTO';

export default function DashboardPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  
  const [tipo, setTipo] = useState<RequestType>('FERIE');
  const [dataInizio, setDataInizio] = useState('');
  const [dataFine, setDataFine] = useState('');
  const [oraInizio, setOraInizio] = useState('');
  const [oraFine, setOraFine] = useState('');
  const [nota, setNota] = useState('');
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const id = localStorage.getItem('employeeId');
    const name = localStorage.getItem('employeeName');
    if (!id) {
      router.push('/access/login-errato'); 
      return;
    }
    setEmployeeId(id);
    setEmployeeName(name || 'Dipendente');
    fetchMyRequests(id);
  }, []);

  async function fetchMyRequests(id: string) {
    const { data } = await supabase
      .from('tbper_requests')
      .select('*')
      .eq('employee_id', id)
      .order('created_at', { ascending: false });
    setRequests(data || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    setLoading(true);
    setMsg({ text: '', type: '' });

    const { error } = await supabase.from('tbper_requests').insert([{
      employee_id: employeeId,
      tipo_richiesta: tipo,
      data_inizio: dataInizio,
      data_fine: dataFine,
      ora_inizio: tipo === 'PERMESSO' ? oraInizio : null,
      ora_fine: tipo === 'PERMESSO' ? oraFine : null,
      protocollo_o_nota: (tipo === 'MALATTIA' || tipo === 'CONGEDO') ? nota : null,
      stato: 'DA APPROVARE'
    }]);

    if (error) {
      setMsg({ text: 'Errore nell\'invio!', type: 'error' });
    } else {
      setMsg({ text: 'Richiesta inviata con successo!', type: 'success' });
      setDataInizio(''); setDataFine(''); setOraInizio(''); setOraFine(''); setNota('');
      fetchMyRequests(employeeId);
    }
    setLoading(false);
  };

  // --- FUNZIONE PER GENERARE IL PDF ---
  const downloadPDF = (req: any) => {
    const doc = new jsPDF();
    
    // Design del PDF
    doc.setFontSize(22);
    doc.text("RICEVUTA RICHIESTA", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Dipendente: ${employeeName}`, 20, 35);
    doc.text(`Tipo: ${req.tipo_richiesta}`, 20, 42);
    doc.text(`Stato: ${req.stato}`, 20, 49);
    doc.text(`Periodo: dal ${req.data_inizio} al ${req.data_fine}`, 20, 56);
    
    if(req.ora_inizio) {
        doc.text(`Orario: dalle ${req.ora_inizio} alle ${req.ora_fine}`, 20, 63);
    }
    
    if(req.protocollo_o_nota) {
        doc.text(`Note/Protocollo: ${req.protocollo_o_nota}`, 20, 70);
    }

    doc.text("--------------------------------------------------", 20, 80);
    doc.setFontSize(10);
    doc.text("Documento generato automaticamente dal sistema Todde Bus", 20, 90);

    doc.save(`richiesta_${req.tipo_richiesta}_${req.data_inizio}.pdf`);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ciao, {employeeName}! 👋</h1>
            <p className="text-gray-500 text-sm">Gestisci le tue richieste qui</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-600 font-medium hover:underline">Esci</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
            <div className="flex items-center gap-2 mb-6">
              <Send className="text-blue-600" size={20} />
              <h2 className="text-xl font-semibold">Nuova Richiesta</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo di richiesta</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value as RequestType)} className="w-full p-2 border rounded-lg bg-gray-50 outline-none">
                  <option value="FERIE">Ferie</option>
                  <option value="PERMESSO">Permesso (Ore)</option>
                  <option value="MALATTIA">Malattia</option>
                  <option value="CONGEDO">Congedo Parentale</option>
                  <option value="LUTTO">Lutto</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dal</label>
                  <input type="date" value={dataInizio} onChange={(e) => setDataInizio(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Al</label>
                  <input type="date" value={dataFine} onChange={(e) => setDataFine(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
              </div>

              {tipo === 'PERMESSO' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dalle ore</label>
                    <input type="time" value={oraInizio} onChange={(e) => setOraInizio(e.target.value)} className="w-full p-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alle ore</label>
                    <input type="time" value={oraFine} onChange={(e) => setOraFine(e.target.value)} className="w-full p-2 border rounded-lg" required />
                  </div>
                </div>
              )}

              {(tipo === 'MALATTIA' || tipo === 'CONGEDO') && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-sm font-medium text-gray-700">Protocollo o Note</label>
                  <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Inserisci numero protocollo o dettagli..." className="w-full p-2 border rounded-lg h-24" />
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-300">
                {loading ? 'Invio in corso...' : 'Invia Richiesta'}
              </button>

              {msg.text && <p className={`text-center text-sm font-medium ${msg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{msg.text}</p>}
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ClipboardList size={20} /> Le tue richieste</h2>
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center text-gray-400 shadow-sm">Nessuna richiesta trovata.</div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 flex justify-between items-center" 
                  style={{ borderLeftColor: req.stato === 'APPROVATA' ? '#22c55e' : req.stato === 'RESPINTA' ? '#ef4444' : '#eab308' }}>
                  <div>
                    <div className="font-bold text-gray-800">{req.tipo_richiesta}</div>
                    <div className="text-xs text-gray-500">{req.data_inizio} - {req.data_fine}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* BOTTONE DOWNLOAD PDF */}
                    <button onClick={() => downloadPDF(req)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition" title="Scarica PDF">
                      <Download size={20} />
                    </button>
                    <div className="flex items-center gap-1">
                        {req.stato === 'APPROVATA' && <CheckCircle2 className="text-green-500" size={20} />}
                        {req.stato === 'RESPINTA' && <XCircle className="text-red-500" size={20} />}
                        {req.stato === 'DA APPROVARE' && <Clock className="text-yellow-500" size={20} />}
                        <span className={`text-xs font-bold uppercase ${req.stato === 'APPROVATA' ? 'text-green-600' : req.stato === 'RESPINTA' ? 'text-red-600' : 'text-yellow-600'}`}>{req.stato.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}