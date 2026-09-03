'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: assign card, 2: form, 3: done
  const [cardCode, setCardCode] = useState('');
  const [cardId, setCardId] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    ig_handle: '',
    cond_follow: false,
    cond_story: false,
    cond_whatsapp: false,
    consent_marketing: false,
    consent_photo: false,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const fileRef = useRef();

  // Step 1: Find next available card
  async function assignCard() {
    setLoading(true);
    setError('');

    // If manual code entered, look it up
    let query = supabase
      .from('gold_cards')
      .select('id, card_code, qr_token')
      .eq('status', 'available')
      .order('id', { ascending: true })
      .limit(1);

    if (cardCode) {
      query = supabase
        .from('gold_cards')
        .select('id, card_code, qr_token')
        .eq('card_code', cardCode.toUpperCase())
        .eq('status', 'available')
        .single();
    }

    const { data, error: err } = cardCode ? await query : await query.single();

    if (err || !data) {
      setError(cardCode ? `Cardul ${cardCode} nu e disponibil` : 'Nu mai sunt carduri disponibile');
      setLoading(false);
      return;
    }

    setCardId(data.id);
    setCardCode(data.card_code);
    setQrToken(data.qr_token);
    setStep(2);
    setLoading(false);
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Compress and resize
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Crop to square from center
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

        canvas.toBlob((blob) => {
          setPhoto(blob);
          setPhotoPreview(canvas.toDataURL());
        }, 'image/jpeg', 0.8);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.name || !form.phone) {
      setError('Numele și telefonul sunt obligatorii');
      setLoading(false);
      return;
    }

    if (!form.consent_marketing) {
      setError('Consimțământul pentru marketing e obligatoriu');
      setLoading(false);
      return;
    }

    try {
      let photoUrl = null;

      // Upload photo if taken
      if (photo) {
        const fileName = `${cardCode}-${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from('photos')
          .upload(fileName, photo, { contentType: 'image/jpeg' });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      }

      // Update card
      const now = new Date().toISOString();
      const { error: updateErr } = await supabase
        .from('gold_cards')
        .update({
          name: form.name.trim(),
          phone: form.phone.trim(),
          ig_handle: form.ig_handle.trim() || null,
          photo_url: photoUrl,
          status: 'pending',
          cond_follow: form.cond_follow,
          cond_story: form.cond_story,
          cond_whatsapp: form.cond_whatsapp,
          consent_marketing: form.consent_marketing,
          consent_marketing_at: form.consent_marketing ? now : null,
          consent_photo: form.consent_photo,
          consent_photo_at: form.consent_photo ? now : null,
          registered_at: now,
        })
        .eq('id', cardId);

      if (updateErr) throw updateErr;

      setSuccess({ code: cardCode, name: form.name });
      setStep(3);
    } catch (err) {
      setError('Eroare la salvare: ' + err.message);
    }

    setLoading(false);
  }

  function resetForm() {
    setStep(1);
    setCardCode('');
    setCardId(null);
    setQrToken('');
    setForm({
      name: '', phone: '', ig_handle: '',
      cond_follow: false, cond_story: false, cond_whatsapp: false,
      consent_marketing: false, consent_photo: false,
    });
    setPhoto(null);
    setPhotoPreview(null);
    setError('');
    setSuccess(null);
  }

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Înregistrare GOLD Card</h1>
        <a href="/" className="text-stone-400 text-sm">← Înapoi</a>
      </div>

      {/* Step 1: Assign card */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-stone-500">Scanează codul de pe card sau ia următorul disponibil.</p>

          <input
            type="text"
            value={cardCode}
            onChange={(e) => setCardCode(e.target.value.toUpperCase())}
            placeholder="GOLD-001 (opțional)"
            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
          />

          <button
            onClick={assignCard}
            disabled={loading}
            className="w-full py-3 bg-gold-500 text-white rounded-xl font-medium hover:bg-gold-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Se caută...' : cardCode ? 'Folosește acest card' : 'Următorul card disponibil'}
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {/* Step 2: Customer form */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 text-center">
            <span className="text-gold-700 font-semibold text-lg">{cardCode}</span>
          </div>

          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-gold-400 transition-colors"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-stone-400 text-3xl">📷</span>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handlePhoto}
              className="hidden"
            />
            <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-gold-600">
              {photoPreview ? 'Schimbă poza' : 'Fă o poză clientului'}
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-stone-500 mb-1">Nume complet *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-stone-500 mb-1">Telefon / WhatsApp *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+40 7xx xxx xxx"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
              required
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm text-stone-500 mb-1">Instagram handle</label>
            <input
              type="text"
              value={form.ig_handle}
              onChange={(e) => setForm({ ...form, ig_handle: e.target.value })}
              placeholder="@handle"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          {/* Conditions checklist */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-stone-700">Verificări pe loc:</p>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.cond_follow}
                onChange={(e) => setForm({ ...form, cond_follow: e.target.checked })}
                className="w-5 h-5 rounded border-stone-300 text-gold-500 focus:ring-gold-400"
              />
              <span className="text-sm">Follow Instagram / TikTok ✓</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.cond_story}
                onChange={(e) => setForm({ ...form, cond_story: e.target.checked })}
                className="w-5 h-5 rounded border-stone-300 text-gold-500 focus:ring-gold-400"
              />
              <span className="text-sm">Story/Post cu tag ✓</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.cond_whatsapp}
                onChange={(e) => setForm({ ...form, cond_whatsapp: e.target.checked })}
                className="w-5 h-5 rounded border-stone-300 text-gold-500 focus:ring-gold-400"
              />
              <span className="text-sm">Număr WhatsApp lăsat ✓</span>
            </label>
          </div>

          {/* Consents */}
          <div className="space-y-3 border-t border-stone-100 pt-4">
            <p className="text-sm font-medium text-stone-700">Consimțământ GDPR:</p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent_marketing}
                onChange={(e) => setForm({ ...form, consent_marketing: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-stone-300 text-gold-500 focus:ring-gold-400"
              />
              <span className="text-sm text-stone-600">
                Sunt de acord să primesc mesaje promoționale pe WhatsApp/SMS. *
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent_photo}
                onChange={(e) => setForm({ ...form, consent_photo: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-stone-300 text-gold-500 focus:ring-gold-400"
              />
              <span className="text-sm text-stone-600">
                Sunt de acord ca poza mea să fie stocată pentru verificarea identității la card.
              </span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Se salvează...' : 'Înregistrează card'}
          </button>
        </form>
      )}

      {/* Step 3: Success */}
      {step === 3 && success && (
        <div className="text-center space-y-6 py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-4xl">
            ✓
          </div>
          <div>
            <h2 className="text-xl font-semibold text-stone-800">{success.code}</h2>
            <p className="text-stone-500 mt-1">
              Înregistrat pentru <strong>{success.name}</strong>
            </p>
            <p className="text-sm text-stone-400 mt-2">
              Status: PENDING — activează-l din panoul Admin diseară.
            </p>
          </div>
          <button
            onClick={resetForm}
            className="w-full py-3 bg-gold-500 text-white rounded-xl font-medium hover:bg-gold-600 transition-colors"
          >
            Următorul client →
          </button>
        </div>
      )}
    </div>
  );
}
