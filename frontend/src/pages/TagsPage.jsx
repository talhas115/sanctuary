import React, { useState, useEffect, useMemo } from 'react';
import {
  Hash,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Tag as TagIcon,
  BookOpen,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useEntryStore } from '../store/entryStore';
import { useNavigate } from 'react-router-dom';

/**
 * Tags Page — Premium Taxonomy Dashboard
 * Clean 3-section layout: Hero header → Tag grid → Insights strip
 */
const TagsPage = () => {
  const { entries, fetchEntries, isLoading } = useEntryStore();
  const navigate = useNavigate();

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Build tag stats sorted by count desc
  const tagStats = useMemo(() => {
    const map = {};
    entries.forEach(entry => {
      entry.tags?.forEach(tag => {
        const name = typeof tag === 'object' ? tag.name : tag;
        if (name) map[name] = (map[name] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  const totalTagUses = tagStats.reduce((sum, t) => sum + t.count, 0);
  const mostActive   = tagStats[0] || null;
  const secondActive = tagStats[1] || null;

  // Colour palette — cycles through tags
  const palettes = [
    { bg: '#EEF2FF', border: '#C7D2FE', text: '#4F46E5', bar: '#818CF8' },
    { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', bar: '#4ADE80' },
    { bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C', bar: '#FB923C' },
    { bg: '#FDF4FF', border: '#E9D5FF', text: '#9333EA', bar: '#C084FC' },
    { bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48', bar: '#FB7185' },
    { bg: '#F0F9FF', border: '#BAE6FD', text: '#0284C7', bar: '#38BDF8' },
    { bg: '#FEFCE8', border: '#FEF08A', text: '#CA8A04', bar: '#FACC15' },
    { bg: '#F0FDFA', border: '#99F6E4', text: '#0D9488', bar: '#2DD4BF' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#F4F5FA]">
      <div className="max-w-[1100px] mx-auto px-5 py-8 lg:px-10 lg:py-10 space-y-8">

        {/* ── SECTION 1: HERO HEADER ── */}
        <div
          className="relative rounded-3xl overflow-hidden p-8 lg:p-12"
          style={{ background: 'linear-gradient(135deg, #2A2DC0 0%, #4648D4 55%, #7B6EF5 100%)' }}
        >
          {/* Dot grid texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}/>

          {/* Blurred blobs */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)' }}/>
          <div style={{ position: 'absolute', bottom: '-30px', left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(30px)' }}/>

          <div className="relative z-10">
            {/* Text block */}
            <div className="mb-6">
              <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.25em] mb-2">Taxonomy</p>
              <h1 className="text-white text-[26px] lg:text-[36px] font-black tracking-tight leading-tight mb-2">
                Your Tag Universe
              </h1>
              <p className="text-white/60 text-[13px] lg:text-[14px] leading-relaxed" style={{ maxWidth: '480px' }}>
                Discover the themes shaping your narrative. Every tag tells a story about what matters most to you.
              </p>
            </div>

            {/* Stat pills — always in a row, wraps on very small screens */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
                <Layers className="w-4 h-4 text-white/60 flex-shrink-0"/>
                <div>
                  <p className="text-white/55 text-[9px] font-black uppercase tracking-widest leading-none mb-0.5">Unique Tags</p>
                  <p className="text-white text-[22px] font-black leading-none tabular-nums">{tagStats.length}</p>
                </div>
              </div>
              <div className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-white/60 flex-shrink-0"/>
                <div>
                  <p className="text-white/55 text-[9px] font-black uppercase tracking-widest leading-none mb-0.5">Total Uses</p>
                  <p className="text-white text-[22px] font-black leading-none tabular-nums">{totalTagUses}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: TAG GRID ── */}
        {isLoading ? (
          <div className="text-center py-20 text-on-surface-variant/40 italic text-sm">Loading tags...</div>
        ) : tagStats.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-outline/20">
            <TagIcon className="w-10 h-10 text-outline/30 mx-auto mb-4"/>
            <p className="text-[16px] font-bold text-on-surface mb-1">No tags yet</p>
            <p className="text-[13px] text-on-surface-variant/60 mb-5">Start tagging your journal entries to see them here.</p>
            <button
              onClick={() => navigate('/entries/new')}
              className="bg-primary text-white px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-primary/90 transition-all shadow-md"
            >
              Write an Entry
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-black text-on-surface tracking-tight">All Tags</h2>
              <span className="text-[12px] text-on-surface-variant/50 font-semibold">{tagStats.length} unique {tagStats.length === 1 ? 'tag' : 'tags'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tagStats.map((tag, idx) => {
                const pal = palettes[idx % palettes.length];
                const pct = totalTagUses > 0 ? Math.round((tag.count / totalTagUses) * 100) : 0;
                const maxCount = tagStats[0]?.count || 1;
                const barWidth = Math.max(8, Math.round((tag.count / maxCount) * 100));

                return (
                  <div
                    key={tag.name}
                    className="group relative bg-white rounded-2xl border p-5 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                    style={{ borderColor: pal.border }}
                    onClick={() => navigate(`/entries?tag=${encodeURIComponent(tag.name)}`)}
                  >
                    {/* Subtle colour wash on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"
                      style={{ background: pal.bg }}/>

                    <div className="relative z-10">
                      {/* Tag name row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: pal.bg, border: `1.5px solid ${pal.border}` }}>
                            <Hash className="w-3.5 h-3.5" style={{ color: pal.text }}/>
                          </div>
                          <span className="text-[14px] font-bold text-on-surface truncate" style={{}}>{tag.name}</span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" style={{ color: pal.text }}/>
                      </div>

                      {/* Count + percentage */}
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-[28px] font-black leading-none tabular-nums" style={{ color: pal.text }}>
                          {tag.count}
                        </span>
                        <span className="text-[11px] font-bold text-on-surface-variant/50">{pct}% of uses</span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 rounded-full bg-outline/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%`, background: pal.bar }}
                        />
                      </div>

                      <p className="text-[11px] text-on-surface-variant/50 mt-2 font-medium">
                        {tag.count === 1 ? '1 entry' : `${tag.count} entries`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTION 3: INSIGHTS STRIP ── */}
        {tagStats.length >= 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Most Active */}
            <div className="bg-white rounded-2xl border border-outline/20 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-500"/>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-0.5">Most Active</p>
                <p className="text-[15px] font-black text-on-surface truncate">#{mostActive?.name || '—'}</p>
                <p className="text-[11px] text-on-surface-variant/60 font-medium">{mostActive?.count || 0} entries</p>
              </div>
            </div>

            {/* Rising Theme */}
            <div className="bg-white rounded-2xl border border-outline/20 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-500"/>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-0.5">Rising Theme</p>
                <p className="text-[15px] font-black text-on-surface truncate">#{secondActive?.name || mostActive?.name || '—'}</p>
                <p className="text-[11px] text-on-surface-variant/60 font-medium">{(secondActive || mostActive)?.count || 0} entries</p>
              </div>
            </div>

            {/* Coverage */}
            <div className="bg-white rounded-2xl border border-outline/20 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-amber-500"/>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-0.5">Total Uses</p>
                <p className="text-[15px] font-black text-on-surface">{totalTagUses} tag applications</p>
                <p className="text-[11px] text-on-surface-variant/60 font-medium">across {entries.length} entries</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TagsPage;
