import React, { useEffect, useState, useMemo } from 'react';
import { useEntryStore } from '../store/entryStore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Plus, 
  Clock, 
  Tag, 
  Search, 
  Filter, 
  ChevronDown, 
  Image as ImageIcon,
  PenLine,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Share2,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { decryptContent } from '../utils/crypto';

/**
 * Stitch Journal Entries UI - Structured Journal Feed
 * Strictly replicates the Stitch Sanctuary UI with:
 * 1. LEFT: Filters Sidebar (Secondary)
 * 2. RIGHT: Timeline Entries List
 */

const EntryList = () => {
  const { entries, isLoading, fetchEntries } = useEntryStore();
  const navigate = useNavigate();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, 7days, 30days
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleShare = async (e, entryId) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/public/generate/${entryId}`);
      const shareUuid = response.data.uuid;
      const shareUrl = `${window.location.origin}/share/${shareUuid}`;
      window.open(shareUrl, '_blank');
    } catch (error) {
      console.error('Share failed', error);
      alert('Could not generate share link. Make sure the entry is public.');
    }
  };

  // Decrypt and Filter Logic
  const filteredEntries = useMemo(() => {
    let result = entries;

    // 1. Search Query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(lowerQuery) || 
        e.content?.replace(/<[^>]+>/g, '').toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Date Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (dateFilter === '7days') cutoff.setDate(now.getDate() - 7);
      if (dateFilter === '30days') cutoff.setDate(now.getDate() - 30);
      result = result.filter(e => new Date(e.createdAt) >= cutoff);
    }

    // 3. Tag Filter
    if (tagFilter !== 'all') {
      result = result.filter(e => 
        e.tags?.some(t => (typeof t === 'object' ? t.name : t) === tagFilter)
      );
    }

    // 4. Sort
    result.sort((a, b) => {
      const d1 = new Date(a.createdAt);
      const d2 = new Date(b.createdAt);
      return sortBy === 'desc' ? d2 - d1 : d1 - d2;
    });

    return result;
  }, [entries, searchQuery, dateFilter, tagFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-full overflow-hidden flex flex-col animate-in fade-in duration-700 bg-[#F9FAFB]">
      
      {/* ── HEADER SECTION: Search & Title ── */}
      <header className="flex-shrink-0 bg-white border-b border-outline/10 px-8 py-8 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-[32px] font-bold text-on-surface tracking-tight leading-none">Journal Entries</h1>
              <p className="text-[16px] text-on-surface-variant mt-2">Documenting your journey, one thought at a time.</p>
            </div>
            
            <div className="relative flex items-center gap-3">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sort by</span>
              <div className="relative group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-surface-variant/30 border border-outline/10 px-4 pr-10 py-2 rounded-full text-[13px] font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value="desc">Date (Descending)</option>
                  <option value="asc">Date (Ascending)</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Large Local Search Bar */}
          <div className="relative group max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search entries, keywords, or patterns..."
              className="w-full bg-surface-variant/30 text-on-surface pl-14 pr-6 py-4 rounded-[20px] border border-outline/10 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
            />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT: 2-Column Split ── */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1200px] mx-auto h-full flex px-8 lg:px-12 py-10 gap-10">
          
          {/* LEFT: Filters Sidebar */}
          <aside className="w-[220px] flex-shrink-0 space-y-10 hidden md:block">
            {/* Date Range */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-on-surface-variant/50 tracking-[0.2em] uppercase flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Date Range
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Last 7 days', value: '7days' },
                  { label: 'Last 30 days', value: '30days' },
                  { label: 'All time', value: 'all' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => { setDateFilter(opt.value); setCurrentPage(1); }}
                      className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${dateFilter === opt.value ? 'border-primary bg-primary' : 'border-outline group-hover:border-primary/50'}`}
                    >
                      {dateFilter === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={`text-[14px] font-medium transition-colors ${dateFilter === opt.value ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Tags */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-on-surface-variant/50 tracking-[0.2em] uppercase flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Quick Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Reflection', 'Work', 'Growth', 'Health', 'Travel'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setTagFilter(tag === tagFilter ? 'all' : tag); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                      tagFilter === tag 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-white text-on-surface-variant border-outline/20 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => { setDateFilter('all'); setTagFilter('all'); setSearchQuery(''); setCurrentPage(1); }}
              className="text-[11px] font-black text-primary hover:text-primary/70 tracking-widest uppercase transition-colors"
            >
              Reset Filters
            </button>
          </aside>

          {/* RIGHT: Entries List */}
          <main className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20 scrollbar-hide">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 italic text-on-surface-variant/50">Curating your timeline...</div>
            ) : paginatedEntries.length > 0 ? (
              <>
                <div className="grid gap-6">
                  {paginatedEntries.map((entry, idx) => {
                    const dateObj = new Date(entry.createdAt);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

                    return (
                      <div 
                        key={entry.id}
                        onClick={() => navigate(`/entries/${entry.id}`)}
                        className="bg-white rounded-[24px] border border-outline/20 shadow-subtle hover:shadow-elevated hover:border-primary/20 transition-all cursor-pointer overflow-hidden group flex flex-col items-stretch"
                      >
                        <div className="flex-1 p-7 flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-black text-on-surface-variant/40 tracking-widest uppercase">{formattedDate}</span>
                            <span className="text-[11px] font-bold text-on-surface-variant/60 bg-surface-variant/30 px-2 py-0.5 rounded flex items-center gap-1">
                              {entry.wordCount || 0} words
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-[20px] font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                              {entry.title || 'Untitled Entry'}
                            </h3>
                            {entry.isEncrypted && <Lock className="w-4 h-4 text-primary opacity-40 mt-1" />}
                          </div>

                          <p className="text-[15px] text-on-surface-variant leading-relaxed line-clamp-2 mb-6">
                            {entry.content?.replace(/<[^>]+>/g, '') || 'No content yet.'}
                          </p>

                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {entry.tags?.slice(0, 2).map((tag, tIdx) => (
                                <span key={tIdx} className="bg-primary/5 text-primary text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase border border-primary/5">
                                  {typeof tag === 'object' ? tag.name : tag}
                                </span>
                              ))}
                              {entry.tags?.length > 2 && (
                                <span className="text-[10px] font-bold text-on-surface-variant/40 pt-1">+{entry.tags.length - 2} more</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {entry.visibility === 'public' && (
                                <button 
                                  onClick={(e) => handleShare(e, entry.id)}
                                  title="View Public Share"
                                  className="p-1.5 rounded-full hover:bg-primary/5 text-primary/60 hover:text-primary transition-all"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              )}
                              <MoreVertical className="w-4 h-4 text-on-surface-variant/30 group-hover:text-on-surface-variant transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-10">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                          currentPage === i + 1 
                            ? 'bg-primary text-white shadow-elevated' 
                            : 'text-on-surface-variant hover:bg-surface-variant'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant disabled:opacity-30 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-[32px] border border-outline/10 shadow-subtle">
                <p className="text-[18px] font-bold text-on-surface">No entries match your filters</p>
                <p className="text-[15px] text-on-surface-variant mt-1">Try adjusting your search or resetting filters.</p>
                <button 
                  onClick={() => { setDateFilter('all'); setTagFilter('all'); setSearchQuery(''); }}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <Link 
        to="/entries/new"
        className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-full shadow-elevated flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
        title="Create New Entry"
      >
        <PenLine className="w-7 h-7 group-hover:rotate-12 transition-transform" />
      </Link>
    </div>
  );
};

export default EntryList;
