'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [tab, setTab] = useState('pending');
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);

    if (tab === 'stats') {
      await loadStats();
    } else {
      let query = supabase
        .from('gold_cards')
        .select('*')
        .order('id', { ascending: true });

      if (tab === 'pending') query = query.eq('status', 'pending');
      if (tab === 'active') query = query.eq('status', 'active');
      if (tab === 'all') query = query.neq('status', 'available');

      const { data } = await query;
      setCards(data || []);
    }

    setLoading(false);
  }

  async function loadStats() {
    const { data: allCards } = await supabase
      .from('gold_cards')
      .select('status');

    const { data: allRedemptions } = await supabase
      .from('redemptions')
      .select('redeemed_at, item_redeemed');

    const { count: totalRedemptions } = await supabase
      .from('redemptions')
      .select('*', { count: 'exact', head: true });

    const statusCounts = {};
    (allCards || []).forEach((c) => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    // Redemptions this week
    const now = new Date();
    const monday = new Date(now);
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    const thisWeek = (allRedemptions || []).filter(
      (r) => new Date(r.redeemed_at) >= monday
    ).length;

    // Item breakdown
    const items = {};
    (allRedemptions || []).forEach((r) => {
      items[r.item_redeemed] = (items[r.item_redeemed] || 0) + 1;
    });

    setStats({
      statusCounts,
      totalRedemptions: totalRedemptions || 0,
      thisWeek,
      items,
    });
  }

  async function activateCard(card) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await supabase
      .from('gold_cards')
      .update({
        status: 'active',
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', card.id);

    loadData();
  }

  async function activateAll() {
    const pendingIds = cards.map((c) => c.id);
    if (!pendingIds.length) return;

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await supabase
      .from('gold_cards')
      .update({
        status: 'active',
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .in('id', pendingIds);

    loadData();
  }

  async function blockCard(card) {
    if (!confirm(`Blochezi cardul ${card.card_code} (${card.name})?`)) return;

    await supabase
      .from('gold_cards')
      .update({ status: 'blocked' })
      .eq('id', card.id);

    loadData();
  }

  async function unblockCard(card) {
    await supabase
      .from('gold_cards')
      .update({ status: 'active' })
      .eq('id', card.id);

    loadData();
  }

  const filteredCards = cards.filter(
    (c) =>
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.card_code.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  const tabs = [
    { key: 'pending', label: 'Pending', count: null },
    { key: 'active', label: 'Active', count: null },
    { key: 'all', label: 'Toate', count: null },
    { key: 'stats', label: 'Statistici', count: null },
  ];

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Admin GOLD</h1>
        <a href="/" className="text-stone-400 text-sm">← Înapoi</a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-stone-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === 'stats' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Carduri active" value={stats.statusCounts.active || 0} color="emerald" />
            <StatCard label="Pending" value={stats.statusCounts.pending || 0} color="amber" />
            <StatCard label="Total folosiri" value={stats.totalRedemptions} color="stone" />
            <StatCard label="Folosiri săpt. asta" value={stats.thisWeek} color="gold" />
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <h3 className="font-medium text-stone-700 mb-3">Produse oferite</h3>
            {Object.entries(stats.items).map(([item, count]) => (
              <div key={item} className="flex justify-between py-2 border-b border-stone-50 last:border-0">
                <span className="text-stone-600">{item}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(stats.items).length === 0 && (
              <p className="text-stone-400 text-sm">Nicio folosire încă</p>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <h3 className="font-medium text-stone-700 mb-3">Status carduri</h3>
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="flex justify-between py-2 border-b border-stone-50 last:border-0">
                <span className="text-stone-600 capitalize">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards list */}
      {tab !== 'stats' && (
        <>
          {/* Search + bulk action */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută nume, cod, telefon..."
              className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            {tab === 'pending' && cards.length > 0 && (
              <button
                onClick={activateAll}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 whitespace-nowrap transition-colors"
              >
                Activează toate ({cards.length})
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full" />
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              {search ? 'Niciun rezultat' : 'Niciun card în această categorie'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3"
                >
                  {card.photo_url ? (
                    <img
                      src={card.photo_url}
                      alt={card.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-lg">
                      👤
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{card.name || '—'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        card.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        card.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        card.status === 'blocked' ? 'bg-red-100 text-red-700' :
                        'bg-stone-100 text-stone-500'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 truncate">
                      {card.card_code} · {card.phone || 'fără telefon'}
                      {card.ig_handle ? ` · ${card.ig_handle}` : ''}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {card.status === 'pending' && (
                      <button
                        onClick={() => activateCard(card)}
                        className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors"
                      >
                        Activează
                      </button>
                    )}
                    {card.status === 'active' && (
                      <button
                        onClick={() => blockCard(card)}
                        className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 transition-colors"
                      >
                        Blochează
                      </button>
                    )}
                    {card.status === 'blocked' && (
                      <button
                        onClick={() => unblockCard(card)}
                        className="px-3 py-1.5 border border-stone-200 text-stone-600 rounded-lg text-xs hover:bg-stone-50 transition-colors"
                      >
                        Deblochează
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const bg = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    stone: 'bg-stone-100 text-stone-700',
    gold: 'bg-gold-50 text-gold-700',
  };

  return (
    <div className={`${bg[color]} rounded-xl p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-70">{label}</p>
    </div>
  );
}
