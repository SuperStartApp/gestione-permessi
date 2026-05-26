'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  MessageCircle, 
  Search,
  LayoutDashboard,
  ArrowLeft,
  Pencil,
  FileSpreadsheet,
  Download,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

type RequestStatus = 'DA APPROVARE' | 'APPROVATA' | 'RESPINTA';
type RequestType = 'FERIE' | 'PERMESSO' | 'MALATTIA' | 'CONGEDO' | 'LUTTO';

export default function AdminDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('TUTTE');
  const [searchTerm, setSearchTerm] = useState('');

  // STATI PER LA MODAL DI MODIFICA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);

  // Stati del form nella Modal
  const [editType, setEditType] = useState<RequestType>('FERIE');
  const [editDataStart, setEditDataStart] = useState('');
  const [editDataEnd, setEditDataEnd] = useState('');
  const [editOraStart, setEditOraStart] = useState('');
  const [editOraEnd, setEditOraEnd] = useState('');
  const [editNota, setEditNota] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tbper_requests')
      .select(`
        *,
        tbper_employees (
          nome,
          cognome,
          telefono
        )
      `)
      .order('created_at', { ascending: false });

    if (error) console.error('Errore:', error);
    else setRequests(data || []);
    setLoading(false);
  }

  const updateStatus = async (requestId: string, newStatus: RequestStatus) => {
    const { error } = await supabase.from('tbper_requests').update({ stato: newStatus }).eq('id', requestId);
    if (error) alert('Errore!'); else fetchRequests();
  };

  // --- FUNZIONE PER APRIRE LA MODAL (RISOLTO L'ERRORE!) ---
  const openEditModal = (req: any) => {
    setEditingRequest(req);
    setEditType(req.tipo_richiesta);
    setEditDataStart(req.data_inizio);
    setEditDataEnd(req.data_fine);
    setEditOraStart(req.ora_inizio || '');
    setEditOraEnd(req.ora_fine || '');
    setEditNota(req.protocollo_o_nota || '');
    setIsModalOpen(true);
  };

  // --- FUNZIONE PER SALVARE LE MODIFICHE ---
  const saveEdits = async () => {
    if (!editingRequest) return;
    setLoading(true);
    const { error } = await supabase
      .from('tbper_requests')
      .update({
        tipo_richiesta: editType,
        data_inizio: editDataStart,
        data_fine: editDataEnd,
        ora_inizio: editType === 'PERMESSO' ? editOraStart : null,
        ora_fine: editType === 'PERMESSO' ? editOraEnd : null,
        protocollo_o_nota: (editType === 'MALATTIA' || editType === 'CONGEDO') ? editNota : null,
      })
      .eq('id', editingRequest.id);

    if (error) {
      alert('Errore nel salvataggio!');
    } else {
      setIsModalOpen(false);
      fetchRequests();
    }
    setLoading(false);
  };

  // --- FUNZIONE PER IL PDF (AGGIUNTA!) ---
  const downloadPDF = (req: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("RICEVUTA RICHIESTA", 20, 20);
    doc.setFontSize(12);
    doc.text(`Dipendente: ${req.tbper_employees?.nome} ${req.tbper_employees?.cognome}`, 20, 35);
    doc.text(`Tipo: ${req.tipo_richiesta}`, 20, 42);
    doc.text(`Stato: ${req.stato}`, 20, 49);
    doc.text(`Periodo: dal ${req.data_inizio} al ${req.data_fine}`, 20, 56);
    if(req.ora_inizio) doc.text(`Orario: dalle ${req.ora_inizio} alle ${req.ora_fine}`, 20, 63);
    if(req.protocollo_o_nota) doc.text(`Note/Protocollo: ${req.protocollo_o_nota}`, 20, 70);
    doc.save(`richiesta_${req.id}.pdf`);
  };

  const sendWhatsApp = (req: any) => {
    const emp = req.tbper_employees;
    if (!emp || !emp.telefono) return alert("No telefono!");
    const message = `Ciao ${emp.nome}, la tua richiesta di ${req.tipo_richiesta} del ${req.data_inizio} è stata ${req.stato.toLowerCase()}.`;
    window.open(`https://wa.me/${emp.telefono.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const exportToExcel = () => {
    const dataForExcel = requests.map(req => ({
      Nome: req.tbper_employees?.nome,
      Cognome: req.tbper_employees?.cognome,
      Tipo: req.tipo_richiesta,
      Inizio: req.data_inizio,
      Fine: req.data_fine,
      Stato: req.stato,
      Telefono: req.tbper_employees?.telefono,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Richieste");
    XLSX.writeFile(workbook, "Report_Todde_Bus.xlsx");
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === 'TUTTE' || req.stato === filterStatus;
    const matchesSearch = req.tbper_employees?.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.tbper_employees?.cognome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/home')} className="p-2 hover:bg-red-100 text-red-900 rounded-full transition">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <LayoutDashboard className="text-red-900" /> Torre di Controllo
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm">
              <FileSpreadsheet size={18} /> Scarica Excel
            </button>
            <button onClick={() => setFilterStatus('TUTTE')} className={`px-4 py-2 rounded-full text-sm font-medium ${filterStatus === 'TUTTE' ? 'bg-red-900 text-white' : 'bg-white text-gray-600 border'}`}>TUTTE</button>
            <button onClick={() => setFilterStatus('DA APPROVARE')} className={`px-4 py-2 rounded-full text-sm font-medium ${filterStatus === 'DA APPROVARE' ? 'bg-red-900 text-white' : 'bg-white text-gray-600 border'}`}>DA APPROVARE</button>
            <button onClick={() => setFilterStatus('APPROVATA')} className={`px-4 py-2 rounded-full text-sm font-medium ${filterStatus === 'APPROVATA' ? 'bg-red-900 text-white' : 'bg-white text-gray-600 border'}`}>APPROVATA</button>
            <button onClick={() => setFilterStatus('RESPINTA')} className={`px-4 py-2 rounded-full text-sm font-medim ${filterStatus === 'RESPINTA' ? 'bg-red-900 text-white' : 'bg-white text-gray-600 border'}`}>RESPINTA</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input type="text" placeholder="Cerca per nome dipendente..." className="w-full outline-none text-gray-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-4">Dipendente</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Periodo</th>
                  <th className="p-4">Stato</th>
                  <th className="p-4 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (<tr><td colSpan={5} className="p-10 text-center text-gray-400">Caricamento...</td></tr>) : 
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{req.tbper_employees?.nome} {req.tbper_employees?.cognome}</div>
                      <div className="text-xs text-gray-500">{req.tbper_employees?.telefono}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 font-medium">{req.tipo_richiesta}</td>
                    <td className="p-4 text-sm text-gray-600">{req.data_inizio} - {req.data_fine}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.stato === 'APPROVATA' ? 'bg-green-100 text-green-700' : req.stato === 'RESPINTA' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.stato}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => downloadPDF(req)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition" title="Scarica PDF">
                          <Download size={18} />
                        </button>
                        <button onClick={() => openEditModal(req)} className="p-2 text-gray-600 hover:bg-blue-50 rounded-full transition" title="Modifica">
                          <Pencil size={18} />
                        </button>
                        {req.stato === 'DA APPROVARE' && (
                          <>
                            <button onClick={() => updateStatus(req.id, 'APPROVATA')} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition"><CheckCircle2 size={20} /></button>
                            <button onClick={() => updateStatus(req.id, 'RESPINTA')} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"><XCircle size={20} /></button>
                          </>
                        )}
                        <button onClick={() => sendWhatsApp(req)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><MessageCircle size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DI MODIFICA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Modifica Richiesta</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveEdits(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value as RequestType)} className="w-full p-2 border rounded-lg">
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
                  <input type="date" value={editDataStart} onChange={(e) => setEditDataStart(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Al</label>
                  <input type="date" value={editDataEnd} onChange={(e) => setEditDataEnd(e.target.e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
              </div>
              {editType === 'PERMESSO' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dalle ore</label>
                    <input type="time" value={editOraStart} onChange={(e) => setEditOraStart(e.target.value)} className="w-full p-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alle ore</label>
                    <input type="time" value={editOraEnd} onChange={(e) => setEditOraEnd(e.target.value)} className="w-full p-2 border rounded-lg" required />
                  </div>
                </div>
              )}
              {(editType === 'MALATTIA' || editType === 'CONGEDO') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Note / Protocollo</label>
                  <textarea value={editNota} onChange={(e) => setEditNota(e.target.value)} className="w-full p-2 border rounded-lg h-20" />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Annulla</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300">Salva Modifiche</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}