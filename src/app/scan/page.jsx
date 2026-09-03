'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, getISOWeek, getNextMonday } from '@/lib/supabase';

export default function ScanPage() {
  const [mode, setMode] = useState('idle'); // idle, scanning, result
  const [card, setCard] = useState(null);
  const [status, setStatus] = useState(null); // eligible, used, expired, blocked, invalid
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  // Initialize QR scanner
  async function startScanner() {
    setMode('scanning');
    setCard(null);
    setStatus(null);

    // Dynamic import to avoid SSR issues
    const { Html5Qrcode } = await import('html5-qrcode');

    // Small delay to let the DOM render
    await new Promise((r) => setTimeout(r, 200));

    if (!scannerRef.current) return;

    const scanner = new Html5Qrcode('qr-reader');
    scannerInstanceRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract token from URL or raw UUID
          let token = decodedText;
          if (decodedText.includes('/r/')) {
            token = decodedText.split('/r/').pop();
          }
          scanner.stop().catch(() => {});
          lookupCard(token);
        },
        () => {} // ignore errors during scanning
      );
    } catch (err) {
      console.error('Camera error:', err);
      setMode('idle');
    }
  }

  function stopScanner() {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().catch(() => {});
      scannerInstanceRef.current = null;
    }
    setMode('idle');
  }

  async function lookupCard(token) {
    setLoading(true);
    setMode('result');

    // Find card by qr_token
    const { data: cardData, error: cardErr } = await supabase
      .from('gold_cards')
      .select('*')
      .eq('qr_token', token)
      .single();

    if (cardErr || !cardData) {
      setStatus('invalid');
      setLoading(false);
      return;
    }

    setCard(cardData);

    // Check status
    if (cardData.status === 'blocked') {
      setStatus('blocked');
      setLoading(false);
      return;
    }

    if (cardData.status === 'expired' || (cardData.expires_at && new Date(cardData.expires_at) < new Date())) {
      setStatus('expired');
      setLoading(false);
      return;
    }

    if (cardData.status !== 'active') {
      setStatus('not_active');
      setLoading(false);
      return;
    }

    // Check if already used this week
    const { year, week } = getISOWeek();
    const { data: redemption } = await supabase
      .from('redemptions')
      .select('id, redeemed_at, item_redeemed')
      .eq('card_id', cardData.id)
      .eq('iso_year', year)
      .eq('iso_week', week)
      .single();

    if (redemption) {
      setStatus('used');
      setCard({ ...cardData, lastRedemption: redemption });
    } else {
      setStatus('eligible');
    }

    setLoading(false);
  }

  async function handleRedeem() {
    if (!selectedItem || !card) return;

    setRedeeming(true);
    const { year, week } = getISOWeek();
    const staffPin = localStorage.getItem('staff_pin') || 'unknown';

    const { error } = await supabase.from('redemptions').insert({
      card_id: card.id,
      iso_year: year,
      iso_week: week,
      item_redeemed: selectedItem,
      staff_pin: staffPin,
    });

    if (error) {
      if (error.code === '23505') {
        // Duplicate — already redeemed
        setStatus('used');
      } else {
        alert('Eroare: ' + error.message);
      }
    } else {
      setStatus('redeemed');
    }

    setRedeeming(false);
  }

  // Auto-lookup if token in URL (from QR redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      lookupCard(token);
    }
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const statusColors = {
    eligible: 'bg-emerald-500',
    redeemed: 'bg-emerald-500',
    used: 'bg-amber-500',
    expired: 'bg-stone-400',
    blocked: 'bg-red-500',
    not_active: 'bg-stone-400',
    invalid: 'bg-red-500',
  };

  const statusLabels = {
    eligible: 'ELIGIBIL',
    redeemed: 'CONFIRMAT ✓',
    used: 'DEJA FOLOSIT',
    expired: 'EXPIRAT',
    blocked: 'BLOCAT',
    not_active: 'NEACTIVAT',
    invalid: 'CARD INVALID',
  };

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Scanare GOLD Card</h1>
        <a href="/" className="text-stone-400 text-sm">← Înapoi</a>
      </div>

      {/* Idle state */}
      {mode === 'idle' && (
        <div className="space-y-4">
          <button
            onClick={startScanner}
            className="w-full py-12 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center gap-3 hover:border-gold-400 hover:bg-gold-50 transition-colors"
          >
            <span className="text-4xl">📷</span>
            <span className="text-stone-600 font-medium">Scanează QR de pe card</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-stone-50 text-stone-400">sau introdu manual</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Token UUID sau cod card"
              className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
            />
            <button
              onClick={() => {
                if (manualToken.trim()) {
                  // Try as card_code first
                  if (manualToken.toUpperCase().startsWith('GOLD-')) {
                    supabase
                      .from('gold_cards')
                      .select('qr_token')
                      .eq('card_code', manualToken.toUpperCase())
                      .single()
                      .then(({ data }) => {
                        if (data) lookupCard(data.qr_token);
                        else lookupCard(manualToken.trim());
                      });
                  } else {
                    lookupCard(manualToken.trim());
                  }
                }
              }}
              className="px-5 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors"
            >
              Caută
            </button>
          </div>
        </div>
      )}

      {/* Scanning state */}
      {mode === 'scanning' && (
        <div className="space-y-4">
          <div id="qr-reader" ref={scannerRef} className="rounded-2xl overflow-hidden" />
          <button
            onClick={stopScanner}
            className="w-full py-3 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Anulează
          </button>
        </div>
      )}

      {/* Result state */}
      {mode === 'result' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full" />
              <p className="text-stone-500 mt-3">Se verifică...</p>
            </div>
          ) : (
            <>
              {/* Status banner */}
              <div className={`${statusColors[status]} text-white text-center py-4 rounded-xl`}>
                <p className="text-2xl font-bold tracking-wide">{statusLabels[status]}</p>
                {status === 'used' && card?.lastRedemption && (
                  <p className="text-sm mt-1 text-white/80">
                    Disponibil din luni, {getNextMonday().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
                  </p>
                )}
              </div>

              {/* Card info */}
              {card && (
                <div className="bg-white border border-stone-200 rounded-xl p-4 flex gap-4 items-center">
                  {card.photo_url ? (
                    <img
                      src={card.photo_url}
                      alt={card.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gold-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{card.name || 'Fără nume'}</p>
                    <p className="text-stone-500 text-sm">{card.card_code}</p>
                    {card.expires_at && (
                      <p className="text-stone-400 text-xs">
                        Expiră: {new Date(card.expires_at).toLocaleDateString('ro-RO')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Redeem form */}
              {status === 'eligible' && (
                <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                  <p className="font-medium text-stone-700">Ce primește gratuit?</p>

                  <div className="grid grid-cols-2 gap-2">
                    {['Cafea simplă', 'Desert mic'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setSelectedItem(item)}
                        className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedItem === item
                            ? 'border-gold-400 bg-gold-50 text-gold-700'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        {item === 'Cafea simplă' ? '☕' : '🍰'} {item}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleRedeem}
                    disabled={!selectedItem || redeeming}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {redeeming ? 'Se confirmă...' : 'Confirmă oferta'}
                  </button>
                </div>
              )}

              {/* Redeemed confirmation */}
              {status === 'redeemed' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-emerald-700 font-medium">
                    {selectedItem} — confirmat ✓
                  </p>
                </div>
              )}

              {/* Scan again */}
              <button
                onClick={() => {
                  setMode('idle');
                  setCard(null);
                  setStatus(null);
                  setSelectedItem('');
                  setManualToken('');
                }}
                className="w-full py-3 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Scanează alt card
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
