'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://gold-card-system.vercel.app';

function getQRUrl(token) {
  const scanUrl = `${BASE_URL}/r/${token}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(scanUrl)}&margin=4`;
}

export default function PrintPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('gold_cards')
        .select('card_code, qr_token, status')
        .order('id', { ascending: true });
      setCards(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = cards.filter(c => filter === 'all' || c.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500">Se încarcă cele 200 de carduri...</p>
      </div>
    );
  }

  return (
    <>
      {/* Bara de control - dispare la print */}
      <div className="print:hidden bg-stone-800 text-white p-4 flex items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold">QR Codes GOLD Cards ({filtered.length})</h1>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-stone-700 text-white px-3 py-1.5 rounded-lg text-sm"
          >
            <option value="all">Toate ({cards.length})</option>
            <option value="available">Disponibile ({cards.filter(c=>c.status==='available').length})</option>
            <option value="active">Active ({cards.filter(c=>c.status==='active').length})</option>
            <option value="pending">Pending ({cards.filter(c=>c.status==='pending').length})</option>
          </select>
        </div>
        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-gold-400 text-stone-900 font-semibold rounded-lg hover:bg-gold-300"
        >
          🖨 Print / Salvează PDF
        </button>
      </div>

      {/* Instrucțiuni */}
      <div className="print:hidden bg-amber-50 border-b border-amber-200 px-6 py-3 text-sm text-amber-800">
        <strong>Cum folosești:</strong> Fiecare QR e unic pentru cardul respectiv. 
        Printează, decupează, și lipește fiecare QR pe spatele cardului PVC cu același număr (GOLD-001 pe GOLD-001 etc.).
        La tipografie poți trimite și PDF-ul generat de browser.
      </div>

      {/* Grid de QR-uri */}
      <div className="p-6 grid grid-cols-4 gap-4 print:grid-cols-4 print:gap-2 print:p-2">
        {filtered.map((card) => (
          <div
            key={card.card_code}
            className="border border-stone-200 rounded-xl p-3 flex flex-col items-center gap-2 print:border print:rounded print:p-2 print:break-inside-avoid"
          >
            <img
              src={getQRUrl(card.qr_token)}
              alt={card.card_code}
              className="w-32 h-32 print:w-24 print:h-24"
            />
            <p className="font-bold text-sm text-stone-800">{card.card_code}</p>
            <p className={`text-xs px-2 py-0.5 rounded-full print:hidden ${
              card.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
              card.status === 'pending' ? 'bg-amber-100 text-amber-700' :
              'bg-stone-100 text-stone-500'
            }`}>
              {card.status}
            </p>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body { margin: 0; }
          @page { margin: 8mm; size: A4; }
        }
      `}</style>
    </>
  );
}
