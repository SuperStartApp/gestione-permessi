'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AccessPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token; // Qui catturiamo il token dall'URL

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Cerchiamo il dipendente che ha quel token univoco
    const { data: employee, error: empError } = await supabase
      .from('tbper_employees')
      .select('*')
      .eq('unique_token', token)
      .single();

    if (empError || !employee) {
      setError('Link non valido o non esistente.');
      setLoading(false);
      return;
    }

    // 2. Verifichiamo se il PIN è corretto
    if (employee.pin !== pin) {
      setError('PIN errato. Riprova.');
      setLoading(false);
      return;
    }

    // 3. SE TUTTO È OK: Salviamo i dati del dipendente nel browser
    // Così quando lui va alla dashboard, il sito sa chi è.
    localStorage.setItem('employeeId', employee.id);
    localStorage.setItem('employeeName', `${employee.nome} ${employee.cognome}`);
    
    // Mandiamolo alla sua dashboard
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Accesso Dipendente</h1>
          <p className="text-sm text-gray-500">Inserisci il tuo PIN di 6 cifre</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Verifica...' : 'Entra'}
          </button>
        </form>
      </div>
    </main>
  );
}