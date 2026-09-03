'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://gold-card-system.vercel.app';
const GOLD = '#c9a844';

function qrUrl(token) {
  const scanUrl = `${BASE_URL}/r/${token}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(scanUrl)}&margin=1&color=c9a844&bgcolor=080806`;
}

function Logo() {
  return (
    <svg width="78" height="70" viewBox="0 0 78 70" fill="none">
      <circle cx="39" cy="32" r="28" stroke={GOLD} strokeWidth="0.8" />
      <text x="39" y="24" textAnchor="middle" fontFamily="Georgia,serif" fontSize="17" fontWeight="bold" fill={GOLD} letterSpacing="3">EM</text>
      <polyline points="39,28 55,43 23,43" fill="none" stroke={GOLD} strokeWidth="0.75" strokeLinejoin="round" />
      <rect x="26" y="43" width="26" height="17" fill="none" stroke={GOLD} strokeWidth="0.75" />
      <rect x="46" y="34" width="4" height="10" fill="none" stroke={GOLD} strokeWidth="0.65" />
      <rect x="47" y="36" width="2" height="2.5" fill="none" stroke={GOLD} strokeWidth="0.5" />
      <rect x="35" y="50" width="8" height="10" fill="none" stroke={GOLD} strokeWidth="0.55" />
    </svg>
  );
}

function Icons() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
      <div style={{ height: '0.5px', width: 16, background: GOLD + '60' }} />
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M1.5 4.5h8v5a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 011.5 9.5v-5z" stroke={GOLD} strokeWidth="0.6" />
        <path d="M9.5 6h1a1 1 0 010 2h-1" stroke={GOLD} strokeWidth="0.6" />
        <path d="M4 3c0-.8.8-.8.8-1.6" stroke={GOLD} strokeWidth="0.6" strokeLinecap="round" />
        <path d="M6.5 3c0-.8.8-.8.8-1.6" stroke={GOLD} strokeWidth="0.6" strokeLinecap="round" />
      </svg>
      <span style={{ color: GOLD + '40', fontSize: 5 }}>•</span>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <rect x="1.5" y="6" width="10" height="5.5" stroke={GOLD} strokeWidth="0.6" />
        <path d="M1.5 7.8h10" stroke={GOLD} strokeWidth="0.5" />
        <path d="M6.5 2s-2 1.5-2 3h4c0-1.5-2-3-2-3z" stroke={GOLD} strokeWidth="0.6" fill="none" />
      </svg>
      <span style={{ color: GOLD + '40', fontSize: 5 }}>•</span>
      <svg width="10" height="13" viewBox="0 0 10 13" fill="none">
        <line x1="5" y1="1" x2="5" y2="12" stroke={GOLD} strokeWidth="0.5" />
        <ellipse cx="5" cy="3.5" rx="3.5" ry="1" stroke={GOLD} strokeWidth="0.6" />
        <ellipse cx="5" cy="6.5" rx="4" ry="1" stroke={GOLD} strokeWidth="0.6" />
        <ellipse cx="5" cy="9.5" rx="3.5" ry="1" stroke={GOLD} strokeWidth="0.6" />
      </svg>
      <div style={{ height: '0.5px', width: 16, background: GOLD + '60' }} />
    </div>
  );
}

function CardFront({ code }) {
  return (
    <div className="card">
      <div className="frame" />
      <div className="inner front-inner">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Logo />
          <div style={{ color: GOLD, fontFamily: 'Georgia,serif', fontSize: 12, letterSpacing: 6, fontWeight: 'bold', marginTop: 1 }}>EM HOUSE</div>
          <Icons />
          <div style={{ color: GOLD + '55', fontSize: 6.5, letterSpacing: 2.5, marginTop: 1 }}>COFFEE &nbsp;·&nbsp; CAKES &nbsp;·&nbsp; KEBAB</div>
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ color: GOLD, fontFamily: 'Georgia,serif', fontSize: 21, fontStyle: 'italic', letterSpacing: 1, fontWeight: 'bold', lineHeight: 1 }}>GOLD CARD</div>
            <div style={{ color: GOLD + '48', fontSize: 7, letterSpacing: 1, marginTop: 3, fontFamily: 'Georgia,serif', fontStyle: 'italic' }}>Taste that feels like home.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: GOLD + '50', fontSize: 8, letterSpacing: 2, fontFamily: 'monospace' }}>{code}</div>
            <div style={{ color: GOLD + '30', fontSize: 7, letterSpacing: 1, marginTop: 2 }}>emhouse.co.uk</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardBack({ code, token }) {
  return (
    <div className="card">
      <div className="frame" />
      <div className="inner back-inner">
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 74, height: 74, border: '0.5px solid ' + GOLD, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={qrUrl(token)} alt={code} style={{ width: 68, height: 68, display: 'block' }} />
            </div>
            <div style={{ color: GOLD + '36', fontSize: 6, letterSpacing: 1 }}>SCANEAZA</div>
          </div>
          <div style={{ flex: 1, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ color: GOLD, fontFamily: 'Georgia,serif', fontSize: 12.5, fontWeight: 'bold', lineHeight: 1.5 }}>
              1 desert mic<br />
              <span style={{ color: GOLD + '66', fontSize: 8, letterSpacing: 1 }}>SAU</span><br />
              1 cafea simpla
            </div>
            <div style={{ color: '#e8c870', fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'bold', letterSpacing: 2, lineHeight: 1 }}>GRATIS</div>
            <div style={{ color: GOLD + '72', fontSize: 7, lineHeight: 1.7 }}>
              O data pe saptamana &nbsp;·&nbsp; cu o comanda platita<br />
              Valabil 12 luni de la activare
            </div>
          </div>
        </div>
        <div style={{ height: '0.5px', background: GOLD + '30' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ color: GOLD + '36', fontSize: 6, lineHeight: 1.6, maxWidth: 230 }}>
            Netransferabil · valabil doar cu titular prezent<br />
            EM House isi rezerva dreptul de a modifica conditiile
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: GOLD, fontFamily: 'Georgia,serif', fontSize: 9, letterSpacing: 1 }}>emhouse.co.uk</div>
            <div style={{ color: GOLD + '38', fontSize: 7, fontFamily: 'monospace', marginTop: 2 }}>{code}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrintPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('both');
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(20);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('gold_cards')
        .select('id, card_code, qr_token, status')
        .order('id', { ascending: true });
      setCards(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const visible = cards.filter(c => c.id >= from && c.id <= to);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716c' }}>Se incarca cardurile...</div>;
  }

  return (
    <>
      <div className="controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 15 }}>EM House — GOLD Cards</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ opacity: 0.7 }}>De la</span>
            <input type="number" min="1" max="200" value={from}
              onChange={e => setFrom(Math.max(1, Number(e.target.value) || 1))}
              style={{ width: 60, padding: '5px 8px', borderRadius: 6, border: 'none', background: '#44403c', color: 'white' }} />
            <span style={{ opacity: 0.7 }}>pana la</span>
            <input type="number" min="1" max="200" value={to}
              onChange={e => setTo(Math.min(200, Number(e.target.value) || 1))}
              style={{ width: 60, padding: '5px 8px', borderRadius: 6, border: 'none', background: '#44403c', color: 'white' }} />
          </div>
          <select value={mode} onChange={e => setMode(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#44403c', color: 'white', fontSize: 13 }}>
            <option value="both">Fata + Spate</option>
            <option value="front">Doar Fata</option>
            <option value="back">Doar Spate (QR)</option>
          </select>
          <span style={{ fontSize: 13, opacity: 0.6 }}>{visible.length} carduri</span>
        </div>
        <button onClick={() => window.print()} className="print-btn">Print / Salveaza PDF</button>
      </div>

      <div className="hint">
        La print in Chrome: bifeaza <strong>&quot;Background graphics&quot;</strong> (altfel fundalul negru nu apare) si seteaza Margins pe <strong>None</strong>. Recomandat: 20 de carduri odata.
      </div>

      <div className="sheet">
        {visible.map(card => (
          <div key={card.card_code} className="pair">
            {(mode === 'both' || mode === 'front') && <CardFront code={card.card_code} />}
            {(mode === 'both' || mode === 'back') && <CardBack code={card.card_code} token={card.qr_token} />}
          </div>
        ))}
      </div>

      <style jsx global>{`
        body { margin: 0; background: #fafaf9; font-family: system-ui, sans-serif; }
        .controls {
          position: sticky; top: 0; z-index: 20;
          background: #1c1917; color: white;
          padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .print-btn {
          padding: 9px 20px; background: #c9a844; color: #1c1917;
          font-weight: 600; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;
        }
        .hint {
          background: #fef3c7; color: #78350f; padding: 10px 20px; font-size: 13px; line-height: 1.6;
        }
        .sheet { padding: 24px; display: flex; flex-direction: column; gap: 24px; align-items: center; }
        .pair { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
        .card {
          width: 85.6mm; height: 54mm;
          background: #080806;
          border-radius: 3mm;
          position: relative; overflow: hidden;
          flex-shrink: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .frame {
          position: absolute; inset: 2.5mm;
          border: 0.5px solid #c9a844;
          border-radius: 1.5mm; z-index: 2; pointer-events: none;
        }
        .inner { position: absolute; inset: 5mm; z-index: 1; }
        .front-inner {
          display: flex; flex-direction: column;
          align-items: center; justify-content: space-between;
        }
        .back-inner {
          display: flex; flex-direction: column; justify-content: space-between;
        }
        @media print {
          .controls, .hint { display: none !important; }
          body { background: white; }
          .sheet { padding: 0; gap: 4mm; }
          .pair { page-break-inside: avoid; gap: 4mm; }
          @page { margin: 6mm; size: A4 portrait; }
        }
      `}</style>
    </> 
  );
}
