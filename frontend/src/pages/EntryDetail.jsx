import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEntryStore } from '../store/entryStore';
import { 
  ArrowLeft, Edit2, Trash2, Lock, Globe, Clock, 
  Download, Share2, Loader2, Tag
} from 'lucide-react';
import api from '../services/api';


const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntryById, deleteEntry, entries } = useEntryStore();
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);


  // Index-based prev/next navigation within the entries list
  const allEntries = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const currentIndex = allEntries.findIndex(e => e.id === id);
  const prevEntry = currentIndex < allEntries.length - 1 ? allEntries[currentIndex + 1] : null;
  const nextEntry = currentIndex > 0 ? allEntries[currentIndex - 1] : null;

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      const data = await getEntryById(id);
      if (data) {
        setEntry(data);
      } else {
        navigate('/entries', { replace: true });
      }
      setIsLoading(false);
    };
    fetchEntry();
  }, [id, getEntryById, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/entries/${id}`);
      deleteEntry(id);
      navigate('/entries');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/export/${id}?format=pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `journal_entry_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const handleShare = async () => {
    try {
      const response = await api.post(`/public/generate/${id}`);
      const shareUuid = response.data.uuid;
      const shareUrl = `${window.location.origin}/share/${shareUuid}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!entry) return null;

  const wordCount = entry.content
    ? entry.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(w => w.length > 0).length
    : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const tags = entry.tags ? entry.tags.map(t => typeof t === 'object' ? t.name : t) : [];

  return (
    // Full-height inner-scroll layout matching the editor pattern
    <div className="h-full overflow-hidden flex justify-center px-6 py-5 font-sans">
      <div className="w-full max-w-[760px] flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 40px)' }}>

        {/* ── PINNED HEADER BAR ── */}
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          {/* Back */}
          <button
            onClick={() => navigate('/entries')}
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors group"
          >
            <span className="w-8 h-8 rounded-full bg-white border border-outline/20 shadow-sm flex items-center justify-center group-hover:shadow transition-all">
              <ArrowLeft className="w-4 h-4" />
            </span>
            <span className="hidden sm:block">All Entries</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {entry.visibility === 'public' && (
              <button onClick={handleShare} title="Copy Share Link"
                className="w-8 h-8 rounded-full bg-white border border-outline/20 shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button onClick={handleExport} title="Export PDF"
              className="w-8 h-8 rounded-full bg-white border border-outline/20 shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
              <Download className="w-3.5 h-3.5" />
            </button>
            <Link to={`/entries/${id}/edit`} title="Edit entry"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-outline/20 shadow-sm text-sm font-semibold text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </Link>
            <button onClick={handleDelete} disabled={isDeleting} title="Delete entry"
              className="w-8 h-8 rounded-full bg-white border border-outline/20 shadow-sm flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error/30 transition-all disabled:opacity-50">
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT CARD ── */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-outline/20 shadow-sm">
          <div className="px-10 py-10">

            {/* Visibility badge */}
            <div className="flex items-center gap-2 mb-6">
              {entry.isPrivate
                ? <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/60 bg-surface-variant/50 px-2.5 py-1 rounded-full">
                    <Lock className="w-2.5 h-2.5" /> Private
                  </span>
                : <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-primary/70 bg-primary/8 px-2.5 py-1 rounded-full">
                    <Globe className="w-2.5 h-2.5" /> Public
                  </span>
              }
            </div>

            {/* Title */}
            <h1 className="text-[32px] font-bold text-on-surface leading-tight tracking-tight mb-4">
              {entry.title || 'Untitled Entry'}
            </h1>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-5">
              <span className="text-sm font-medium text-on-surface-variant">{formattedDate}</span>
              <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                <Clock className="w-3.5 h-3.5 text-outline-variant" />
                {readTime} min read · {wordCount.toLocaleString()} words
              </span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-[12px] font-semibold px-3 py-1 rounded-full">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-outline/15 mb-8" />

            {/* Content — prose rendered from rich text */}
            <div
              className="prose max-w-none
                prose-p:text-[16px] prose-p:leading-8 prose-p:text-on-surface/85 prose-p:mb-5
                prose-h1:font-bold prose-h1:text-on-surface prose-h1:text-2xl prose-h1:mb-3
                prose-h2:font-semibold prose-h2:text-on-surface prose-h2:text-xl prose-h2:mb-3
                prose-h3:font-semibold prose-h3:text-on-surface prose-h3:text-lg prose-h3:mb-2
                prose-strong:text-on-surface prose-strong:font-bold
                prose-em:italic prose-em:text-on-surface/80
                prose-ul:list-disc prose-ul:ml-6 prose-ul:text-[16px] prose-ul:leading-8 prose-ul:text-on-surface/85
                prose-ol:list-decimal prose-ol:ml-6 prose-ol:text-[16px] prose-ol:leading-8 prose-ol:text-on-surface/85
                prose-a:text-primary prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic
              "
              dangerouslySetInnerHTML={{
                __html: entry.content || '<p class="text-on-surface-variant italic">No content yet.</p>'
              }}
            />
          </div>

          {/* ── PREV / NEXT NAVIGATION ── */}
          {(prevEntry || nextEntry) && (
            <div className="flex items-stretch gap-4 mx-10 mb-8 border-t border-outline/15 pt-8">
              {prevEntry ? (
                <Link to={`/entries/${prevEntry.id}`} 
                  className="flex-1 flex flex-col gap-1 p-4 bg-surface-variant/30 hover:bg-surface-variant/60 rounded-xl transition-colors group">
                  <span className="text-[10px] font-black text-on-surface-variant/50 tracking-widest uppercase">← Previous</span>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                    {prevEntry.title || 'Untitled Entry'}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(prevEntry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </Link>
              ) : <div className="flex-1" />}

              {nextEntry ? (
                <Link to={`/entries/${nextEntry.id}`}
                  className="flex-1 flex flex-col gap-1 p-4 bg-surface-variant/30 hover:bg-surface-variant/60 rounded-xl transition-colors group text-right">
                  <span className="text-[10px] font-black text-on-surface-variant/50 tracking-widest uppercase">Next →</span>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                    {nextEntry.title || 'Untitled Entry'}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(nextEntry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EntryDetail;
