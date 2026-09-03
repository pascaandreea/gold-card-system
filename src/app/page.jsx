'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    const { data, error: err } = await supabase
      .from('staff')
      .select('name, role, pin')
      .eq('pin', pin)
      .eq('active', true)
      .single();

    if (err || !data) {
      setError('PIN invalid');
      return;
    }

    localStorage.setItem('staff_pin', data.pin);
    localStorage.setItem('staff_name', data.name);
    localStorage.setItem('staff_role', data.role);

    if (data.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/scan';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-400 text-white text-2xl font-bold mb-4">
            G
          </div>
          <h1 className="text-2xl font-semibold text-stone-800">GOLD Card System</h1>
          <p className="text-stone-500 mt-1">Introdu PIN-ul de staff</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="• • • •"
            className="w-full text-center text-3xl tracking-[0.5em] py-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            autoFocus
          />
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors"
          >
            Intră
          </button>
        </form>

        <div className="mt-6 flex gap-3">
          <a
            href="/register"
            className="flex-1 py-3 text-center border border-stone-200 rounded-xl text-stone-600 text-sm hover:bg-stone-100 transition-colors"
          >
            Înregistrare
          </a>
          <a
            href="/scan"
            className="flex-1 py-3 text-center border border-stone-200 rounded-xl text-stone-600 text-sm hover:bg-stone-100 transition-colors"
          >
            Scanare
          </a>
        </div>
      </div>
    </div>
  );
}
