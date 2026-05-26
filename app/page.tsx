'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Clock, FileText } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      {/* Logo o Titolo principale */}
      <div className="mb-8 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-red-900 text-white rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto shadow-xl mb-4">
          T
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Todde <span className="text-red-900">Bus</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sistema Gestionale SuPeR HO.RE.CA. Edition per la gestione intelligente di ferie, permessi e presenze.
        </p>
      </div>

      {/* Grid di caratteristiche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="text-red-900 mb-4 flex justify-center"><ShieldCheck size={32} /></div>
          <h3 className="font-bold text-lg mb-2">Sicurezza</h3>
          <p className="text-gray-500 text-sm">Accesso protetto tramite token univoco e PIN personale.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="text-red-900 mb-4 flex justify-center"><Clock size={32} /></div>
          <h3 className="font-bold text-lg mb-2">Velocità</h3>
          <p className="text-gray-500 text-sm">Invia la tua richiesta in pochi secondi direttamente dallo smartphone.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="text-red-900 mb-4 flex justify-center"><FileText size={32} /></div>
          <h3 className="font-bold text-lg mb-2">Trasparenza</h3>
          <p className="text-gray-500 text-sm">Monitora in tempo reale lo stato di approvazione delle tue pratiche.</p>
        </div>
      </div>

      {/* Bottone Call to Action */}
      <button 
        onClick={() => alert("Per accedere, utilizza il link univoco inviato dalla tua azienda.")}
        className="flex items-center gap-2 bg-red-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-800 transition-all transform hover:scale-105 shadow-lg"
      >
        Area Dipendenti <ArrowRight size={20} />
      </button>

      <div className="mt-12 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Todde Bus - Tutti i diritti riservati.
      </div>
    </main>
  );
}