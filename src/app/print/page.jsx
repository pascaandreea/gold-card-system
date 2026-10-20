'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://gold-card-system.vercel.app';
const GOLD = '#c9a844';

function qrUrl(token) {
  const scanUrl = `${BASE_URL}/r/${token}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(scanUrl)}&margin=0&color=c9a844&bgcolor=080806`;
}

function Logo() {
  return (
    <svg width="80" height="72" viewBox="0 0 78 70" fill="none">
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
      <div style={{ height: '0.5px', width: 18, background: GOLD + '60' }} />
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
      <div style={{ height: '0.5px', width: 18, background: GOLD + '60' }} />
    </div>
  );
}

function CardFront({ code }) {
  return (
    <div className="card">
      <div className="frame" />
      <div className="inner front-inner">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Logo />
          <div style={{ color: GOLD, fontFamily: 'Georgia,serif', fontSize: 12.5, letterSpacing: 6, fontWeight: 'bold', marginTop: 1 }}>EM HOUSE</div>
          <Icons />
          <div style={{ color: GOLD + '55', fontSize: 6.5, letterSpacing: 2.5, marginTop: 1 }}>COFFEE &nbsp;·&nbsp; CAKES &nbsp;·&nbsp; KEBAB</div>
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ color: GOLD, fontFamily: 'Georgia,serif', fontSize: 22, fontStyle: 'italic', letterSpacing: 1, fontWeight: 'bold', lineHeight: 1 }}>GOLD CARD</div>
            <div style={{ color: GOLD + '48', fontSize: 7.5, letterSpacing: 1, marginTop: 3, fontFamily: 'Georgia,serif', fontStyle: 'italic' }}>Taste that feels like home.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: GOLD + '55', fontSize: 8.5, letterSpacing: 2, fontFamily: 'monospace' }}>{code}</div>
            <div style={{ color: GOLD + '32', fontSize: 7.5, letterSpacing: 1, marginTop: 2 }}>emhouse.co.uk</div>
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
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 78, height: 78, border: '0.5px solid ' + GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 3 }}>
              <img src={qrUrl(token)} alt={code} style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
            <div style={{ color: GOLD + '40', fontSize: 6, letterSpacing: 1.5 }}>SCAN ME</div>
          </div>
          <div style={{ flex: 1, paddingTop: 2, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ color: GOLD, fontFamily: 'Georgia,serif', fontSize: 13, fontWeight: 'bold', lineHeight: 1.45 }}>
              1 small dessert<br />
              <span style={{ color: GOLD + '66', fontSize: 8.5, letterSpacing: 1 }}>OR</span><br />
              1 regular coffee
            </div>
            <div style={{ color: '#e8c870', fontFamily: 'Georgia,serif', fontSize: 19, fontWeight: 'bold', letterSpacing: 2, lineHeight: 1 }}>FREE</div>
            <div style={{ color: GOLD + '72', fontSize: 7, lineHeight: 1.65 }}>
              Once a week &nbsp;·&nbsp; with any paid order<br />
              Valid for 12 months from activation
            </div>
          </div>
        </div>
        <div style={{ height: '0.5px', background: GOLD + '30' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ color: GOLD + '38', fontSize: 6, lineHeight: 1.55, maxWidth: 230 }}>
            Non-transferable · valid only with cardholder present<br />
            EM House reserves the right to amend these terms
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: GOLD, fontFamily: 'Georgia,serif', fontSize: 9, letterSpacing: 1 }}>emhouse.co.uk</div>
            <div style={{ color: GOLD + '40', fontSize: 7.5, fontFamily: 'monospace', marginTop: 2 }}>{code}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrintPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [side, setSide] = useState('front');
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(200);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('gold_cards')
        .select('id, card_code, qr_token')
        .order('id', { ascending: true });
      setCards(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const visible = cards.filter(c => c.id >= from && c.id <= to);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716c' }}>Loading cards...</div>;
  }

  return (
    <>
      <div className="controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 15 }}>EM House — print files</strong>

          <div className="seg">
            <button
              className={side === 'front' ? 'on' : ''}
              onClick={() => setSide('front')}
            >PDF 1 — FRONT</button>
            <button
              className={side === 'back' ? 'on' : ''}
              onClick={() => setSide('back')}
            >PDF 2 — BACK</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ opacity: 0.7 }}>Cards</span>
            <input type="number" min="1" max="200" value={from}
              onChange={e => setFrom(Math.max(1, Number(e.target.value) || 1))}
              style={{ width: 58, padding: '5px 8px', borderRadius: 6, border: 'none', background: '#44403c', color: 'white' }} />
            <span style={{ opacity: 0.7 }}>to</span>
            <input type="number" min="1" max="200" value={to}
              onChange={e => setTo(Math.min(200, Number(e.target.value) || 1))}
              style={{ width: 58, padding: '5px 8px', borderRadius: 6, border: 'none', background: '#44403c', color: 'white' }} />
          </div>

          <span style={{ fontSize: 13, opacity: 0.6 }}>{visible.length} pages</span>
        </div>
        <button onClick={() => window.print()} className="print-btn">
          Save {side === 'front' ? 'FRONT' : 'BACK'} PDF
        </button>
      </div>

      <div className="hint">
        <strong>85 × 55 mm, one card per page, square corners.</strong>
        Save two separate files: switch to <strong>FRONT</strong> → save as <code>EM-House-GOLD-FRONT.pdf</code>, then switch to <strong>BACK</strong> → save as <code>EM-House-GOLD-BACK.pdf</code>.
        Both must cover the same card range so page 1 of one matches page 1 of the other.
        <br />
        In Chrome: <strong>Destination</strong> Save as PDF · <strong>Margins</strong> None · <strong>Scale</strong> 100% · <strong>Background graphics</strong> ticked · <strong>Headers and footers</strong> unticked.
      </div>

      <div className="sheet">
        {visible.map(card => (
          <div key={card.card_code} className="page">
            {side === 'front'
              ? <CardFront code={card.card_code} />
              : <CardBack code={card.card_code} token={card.qr_token} />}
          </div>
        ))}
      </div>

      <style jsx global>{`
        body { margin: 0; background: #e7e5e4; font-family: system-ui, sans-serif; }

        .controls {
          position: sticky; top: 0; z-index: 20;
          background: #1c1917; color: white;
          padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .seg { display: flex; border-radius: 8px; overflow: hidden; border: 1px solid #57534e; }
        .seg button {
          padding: 7px 14px; background: transparent; color: #a8a29e;
          border: none; cursor: pointer; font-size: 12.5px; font-weight: 600;
          font-family: system-ui, sans-serif;
        }
        .seg button.on { background: #c9a844; color: #1c1917; }
        .print-btn {
          padding: 9px 20px; background: #c9a844; color: #1c1917;
          font-weight: 600; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;
        }
        .hint {
          background: #fef3c7; color: #78350f; padding: 12px 20px; font-size: 13px; line-height: 1.75;
        }
        .hint code { background: #fde9b0; padding: 1px 6px; border-radius: 3px; font-size: 12px; }

        .sheet { padding: 20px; display: flex; flex-direction: column; gap: 14px; align-items: center; }

        .page {
          width: 85mm; height: 55mm;
          display: block;
        }

        /* exact finished size, no bleed, square corners */
        .card {
          width: 85mm;
          height: 55mm;
          background: #080806;
          position: relative;
          overflow: hidden;
          border-radius: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .frame {
          position: absolute; inset: 3mm;
          border: 0.5px solid #c9a844;
          z-index: 2; pointer-events: none;
        }
        .inner { position: absolute; inset: 5.5mm; z-index: 1; }
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
          .sheet { padding: 0; gap: 0; display: block; }
          .page {
            page-break-after: always;
            break-after: page;
            margin: 0;
          }
          .page:last-child { page-break-after: auto; break-after: auto; }
          @page { size: 85mm 55mm; margin: 0; }
        }
      `}</style>
    </>
  );
}
