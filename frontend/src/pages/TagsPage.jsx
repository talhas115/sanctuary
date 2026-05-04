import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag as TagIcon, 
  Hash, 
  TrendingUp, 
  PieChart, 
  Layers, 
  CircleDot,
  ArrowUpRight
} from 'lucide-react';
import { useEntryStore } from '../store/entryStore';

/**
 * Stitch Tag Management UI - Taxonomy Dashboard
 * FINAL Layout Corrections: Fixed grid proportions, header structure, and element cleanup.
 */

const TagsPage = () => {
  const { entries, fetchEntries, isLoading } = useEntryStore();
  
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Extract tags and calculate entry counts
  const tagStats = useMemo(() => {
    const statsMap = {};
    entries.forEach(entry => {
      entry.tags?.forEach(tag => {
        const tagName = typeof tag === 'object' ? tag.name : tag;
        statsMap[tagName] = (statsMap[tagName] || 0) + 1;
      });
    });
    
    return Object.entries(statsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  const mostActiveTag = tagStats[0] || null;
  const highestGrowthTag = tagStats.length > 1 ? tagStats[1] : (tagStats[0] || null);

  // Soft pastel colors for cards
  const cardColors = [
    { bg: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-600', icon: 'bg-indigo-100/50' },
    { bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-600', icon: 'bg-emerald-100/50' },
    { bg: 'bg-rose-50/50', border: 'border-rose-100', text: 'text-rose-600', icon: 'bg-rose-100/50' },
    { bg: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-600', icon: 'bg-amber-100/50' },
    { bg: 'bg-sky-50/50', border: 'border-sky-100', text: 'text-sky-600', icon: 'bg-sky-100/50' },
    { bg: 'bg-violet-50/50', border: 'border-violet-100', text: 'text-violet-600', icon: 'bg-violet-100/50' },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto px-6 py-6 animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto space-y-16">
        
        {/* ── 1. HEADER SECTION: 2-Column Grid ── */}
        <header className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Side: Text content */}
          <div>
            <p className="text-[11px] font-black text-on-surface-variant/40 tracking-[0.2em] uppercase mb-2">Taxonomy</p>
            <h1 className="text-[40px] font-bold text-on-surface tracking-tight leading-tight mb-4">
              Organize Your Thoughts
            </h1>
            <p className="text-[16px] text-on-surface-variant leading-relaxed max-w-2xl">
              Define the underlying structure of your reflections. Use tags to bridge themes across different entries and visualize the patterns in your narrative.
            </p>
          </div>

          {/* Right Side: Stat Card */}
          <div className="flex justify-start md:justify-end">
            <div className="bg-white p-6 rounded-[24px] border border-outline/30 shadow-subtle flex items-center gap-5 min-w-[240px]">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[12px] font-black text-on-surface-variant/50 tracking-wider uppercase">Total Tags</p>
                <p className="text-[32px] font-bold text-on-surface leading-none tabular-nums">{tagStats.length}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── 2. TAG GRID SECTION: Full Width Expansion ── */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tagStats.map((tag, idx) => {
              const style = cardColors[idx % cardColors.length];
              return (
                <div 
                  key={tag.name}
                  className={`${style.bg} ${style.border} border p-6 rounded-xl shadow-sm hover:shadow-subtle transition-all cursor-pointer group relative overflow-hidden`}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className={`text-[15px] font-bold ${style.text} mb-1 flex items-center gap-1`}>
                        <Hash className="w-3.5 h-3.5 opacity-60" />
                        {tag.name}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-8">
                        <span className="text-[48px] font-bold text-on-surface leading-none tracking-tighter tabular-nums">
                          {tag.count}
                        </span>
                        <span className="text-[11px] font-black text-on-surface-variant/40 tracking-widest uppercase">
                          Entries
                        </span>
                      </div>
                    </div>
                    
                    <div className={`w-10 h-10 rounded-xl ${style.icon} flex items-center justify-center ${style.text} group-hover:scale-110 transition-transform`}>
                       <CircleDot className="w-5 h-5" />
                    </div>
                  </div>
                  
                  {/* Subtle Background Decorative Accent */}
                  <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${style.icon} blur-2xl opacity-40 group-hover:opacity-60 transition-opacity`} />
                </div>
              );
            })}
          </div>
          
          {tagStats.length === 0 && !isLoading && (
            <div className="text-center py-24 bg-surface-variant/10 rounded-3xl border-2 border-dashed border-outline-variant/20 text-on-surface-variant/60 font-medium">
              No tags discovered in your narrative yet.
            </div>
          )}
        </section>

        {/* ── 3. INSIGHTS SECTION: Full Width Split ── */}
        <section className="bg-white rounded-[32px] border border-outline/30 shadow-subtle overflow-hidden flex flex-col lg:grid lg:grid-cols-12">
          <div className="lg:col-span-8 p-10 lg:p-14">
            <p className="text-[11px] font-black text-primary tracking-[0.2em] uppercase mb-3">Analysis</p>
            <h2 className="text-[32px] font-bold text-on-surface tracking-tight mb-6">Insights</h2>
            <p className="text-[17px] text-on-surface-variant leading-relaxed mb-10 max-w-3xl">
              Your tag universe visualizes the interconnectedness of your reflections. By tracking the frequency and growth of themes, you can identify which areas of your life are currently taking center stage in your writing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-on-surface-variant/50 tracking-wider uppercase">Most Active</p>
                <div className="flex items-center gap-3">
                  <span className="text-[24px] font-bold text-on-surface">#{mostActiveTag?.name || 'None'}</span>
                  <div className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Core Theme
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-[11px] font-black text-on-surface-variant/50 tracking-wider uppercase">High Growth</p>
                <div className="flex items-center gap-3">
                  <span className="text-[24px] font-bold text-on-surface">#{highestGrowthTag?.name || 'None'}</span>
                  <div className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[11px] font-bold flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Rising
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-surface-variant/40 flex items-center justify-center p-12 border-t lg:border-t-0 lg:border-l border-outline/10">
            <div className="w-full max-w-[240px] aspect-square bg-white rounded-full shadow-elevated flex items-center justify-center relative p-10 group">
              <PieChart className="w-20 h-20 text-primary/20 group-hover:text-primary/40 transition-colors" />
              <div className="absolute inset-4 border-[16px] border-primary/5 rounded-full" />
              <div className="absolute inset-8 border-[12px] border-primary/10 border-t-primary rounded-full animate-[spin_12s_linear_infinite]" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default TagsPage;
