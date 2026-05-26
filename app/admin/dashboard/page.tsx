'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, XCircle, Clock, MessageCircle, Search, 
  LayoutDashboard, ArrowLeft, Pencil, FileSpreadsheet, Download, X 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('TUTTE');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);

  const[editType, setEditType] = useState('FERIE');
  const [editDataStart, setEditDataStart] = useState('');
  const [editDataEnd, setEditDataEnd] = useState('');
  const[editOraStart, setEditOraStart] = useState('');
  const [editOraEnd, setEditOraEnd] = useState('');
  const [editNota, setEditNota] = useState('');

  useEffect(() => {
    fetchRequests();
  },[]);

  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tbper_requests')
      .select(`*, tbper_employees (nome, cognome, telefono)`)
      .order('created_at', { ascending: false });

    if (error) console.error('Errore:', error);
    else setRequests(data ||[]);
    setLoading(false);
  }

  const updateStatus = async (requestId: string, newStatus: string) => {
    await supabase.from('tbper_requests').update({ stato: newStatus }).eq('id', requestId);
    fetchRequests();
  };

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

  const saveEdits = async () => {
    if (!editingRequest) return;
    await supabase.from('tbper_requests').update({
      tipo_richiesta: editType,
      data_inizio: editDataStart,
      data_fine: editDataEnd,
      ora_inizio: editType === 'PERMESSO' ? editOraStart : null,
      ora_fine: editType === 'PERMESSO' ? editOraEnd : null,
      protocollo_o_nota: editNota,
    }).eq('id', editingRequest.id);
    setIsModalOpen(false);
    fetchRequests();
  };

  const downloadPDF = (req: any) => {
    const doc = new jsPDF();
    doc.text("Dettaglio Richiesta", 20, 20);
    doc.text(`Dipendente: ${req.tbper_employees?.nome}`, 20, 30);
    doc.text(`Tipo: ${req.tipo_richiesta}`, 20, 40);
    doc.save(`richiesta_${req.id}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(requests);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "Report.xlsx");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <button onClick={() => router.push('/admin/home')} className="mb-4 flex items-center gap-2"><ArrowLeft /> Torna alla Home</button>
      <h1 className="text-3xl font-bold mb-6">Torre di Controllo</h1>
      <button onClick={exportToExcel} className="bg-green-600 text-white p-2 rounded">Scarica Excel</button>
      
      <div className="bg-white rounded-xl shadow overflow-hidden mt-6">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4">Dipendente</th>
              <th className="p-4">Stato</th>
              <th className="p-4">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b">
                <td className="p-4">{req.tbper_employees?.nome}</td>
                <td className="p-4">{req.stato}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => downloadPDF(req)}><Download /></button>
                  <button onClick={() => openEditModal(req)}><Pencil /></button>
                  <button onClick={() => updateStatus(req.id, 'APPROVATA')}><CheckCircle2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4">Modifica Richiesta</h2>
            <input type="text" value={editDataStart} onChange={(e) => setEditDataStart(e.target.value)} className="border p-2 w-full mb-2" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)}>Annulla</button>
              <button onClick={saveEdits} className="bg-blue-600 text-white p-2">Salva</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}