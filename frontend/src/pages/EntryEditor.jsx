import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { useEntryStore } from '../store/entryStore';
import { encryptContent } from '../utils/crypto';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineLucide,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Calendar as CalendarIconLucide,
  Tag as TagIcon,
  Lock as LockIcon,
  Globe as GlobeIcon,
  Trash2 as TrashIcon,
  Clock as ClockIcon,
  CheckCircle2 as CheckIcon,
  Share2,
  SlidersHorizontal,
  X,
  ChevronLeft,
} from 'lucide-react';

const EntryEditor = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { getEntryById, addEntry, updateEntry, deleteEntry } = useEntryStore();
  const { user } = useAuthStore();

  const [title,       setTitle]       = useState('');
  const [tags,        setTags]        = useState([]);
  const [newTag,      setNewTag]      = useState('');
  const [visibility,  setVisibility]  = useState('private');
  const [isEncrypted, setIsEncrypted] = useState(!isEditing ? (user?.defaultEncryption || false) : false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [wordCount,   setWordCount]   = useState(0);
  const [dateStr,     setDateStr]     = useState(new Date().toISOString().split('T')[0]);
  const [lastSaved,   setLastSaved]   = useState(null);
  const [showSaved,   setShowSaved]   = useState(false);
  const [showMeta,    setShowMeta]    = useState(false); // mobile metadata drawer
  const [,            forceUpdate]    = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: false, orderedList: false, blockquote: false }),
      Underline,
      BulletList.configure({ HTMLAttributes: { class: 'list-disc ml-6' } }),
      OrderedList.configure({ HTMLAttributes: { class: 'list-decimal ml-6' } }),
      ListItem,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
    },
    onTransaction: () => forceUpdate(n => n + 1),
    editorProps: {
      attributes: { class: 'focus:outline-none min-h-[200px] text-[16px] leading-8 text-on-surface/90' }
    }
  });

  // Load entry metadata
  useEffect(() => {
    if (!isEditing) return;
    const fetchEntry = async () => {
      const entry = await getEntryById(id);
      if (entry) {
        setTitle(entry.title || '');
        setTags(entry.tags ? entry.tags.map(t => typeof t === 'object' ? t.name : t) : []);
        setVisibility(entry.visibility || 'private');
        setIsEncrypted(entry.isEncrypted ?? false);
        setDateStr(entry.createdAt ? new Date(entry.createdAt).toISOString().split('T')[0] : dateStr);
        setLastSaved(new Date(entry.updatedAt || entry.createdAt));
      }
    };
    fetchEntry();
  }, [id, isEditing, getEntryById]);

  // Load editor content once editor is ready
  useEffect(() => {
    if (!isEditing || !editor) return;
    const fetchAndSetContent = async () => {
      const entry = await getEntryById(id);
      if (entry && editor) editor.commands.setContent(entry.content || '');
    };
    fetchAndSetContent();
  }, [editor]);

  // Auto-save every 30s when editing
  useEffect(() => {
    if (!editor || !title.trim() || !isEditing) return;
    const timer = setTimeout(() => handleSave(true), 30000);
    return () => clearTimeout(timer);
  }, [title, editor?.getHTML()]);

  const handleSave = async (isAutoSave = false) => {
    if (!title.trim() && !editor?.getText().trim()) return;
    setIsSaving(true);
    try {
      const rawContent = editor.getHTML();
      const finalContent = isEncrypted ? encryptContent(rawContent) : rawContent;
      const payload = {
        title, content: finalContent, visibility, isEncrypted,
        tags: tags.filter(t => t.trim()),
        date: new Date(dateStr).toISOString()
      };
      if (isEditing) {
        const res = await api.put(`/entries/${id}`, payload);
        updateEntry({ ...res.data, content: rawContent });
      } else {
        const res = await api.post('/entries', payload);
        addEntry({ ...res.data, content: rawContent });
      }
      setLastSaved(new Date());
      setShowSaved(true);
      setTimeout(() => { setShowSaved(false); if (!isAutoSave) navigate('/entries'); }, 1500);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleTrash = async () => {
    if (!isEditing) { navigate('/entries'); return; }
    if (window.confirm('Delete this entry?')) {
      await api.delete(`/entries/${id}`);
      deleteEntry(id);
      navigate('/entries');
    }
  };

  const handleShare = async () => {
    if (!isEditing) return;
    try {
      const res = await api.post(`/public/generate/${id}`);
      const url = `${window.location.origin}/share/${res.data.uuid}`;
      await navigator.clipboard.writeText(url);
      alert('Share link copied!');
    } catch { console.error('Share failed'); }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (t) => setTags(tags.filter(tag => tag !== t));
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  /* ── Toolbar buttons ── */
  const formatBtns = [
    { fn: () => editor?.chain().focus().toggleBold().run(),        active: editor?.isActive('bold'),        icon: <BoldIcon className="w-3.5 h-3.5"/>,        title: 'Bold' },
    { fn: () => editor?.chain().focus().toggleItalic().run(),      active: editor?.isActive('italic'),      icon: <ItalicIcon className="w-3.5 h-3.5"/>,      title: 'Italic' },
    { fn: () => editor?.chain().focus().toggleUnderline().run(),   active: editor?.isActive('underline'),   icon: <UnderlineLucide className="w-3.5 h-3.5"/>, title: 'Underline' },
    null, // separator
    { fn: () => editor?.chain().focus().toggleBulletList().run(),  active: editor?.isActive('bulletList'),  icon: <ListIcon className="w-3.5 h-3.5"/>,        title: 'Bullet List' },
    { fn: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList'), icon: <ListOrderedIcon className="w-3.5 h-3.5"/>, title: 'Ordered List' },
  ];

  /* ── Metadata panel content (shared between desktop sidebar & mobile drawer) ── */
  const MetaPanel = () => (
    <div className="flex flex-col gap-4 p-4 lg:p-0">

      {/* Date */}
      <div className="bg-white rounded-xl border border-outline/20 shadow-sm">
        <p className="px-4 pt-3 pb-0.5 text-[9px] font-black text-on-surface-variant/50 tracking-[0.15em] uppercase">Entry Date</p>
        <div className="flex items-center gap-2 px-4 pb-3">
          <CalendarIconLucide className="w-3.5 h-3.5 text-primary flex-shrink-0"/>
          <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)}
            className="text-sm font-medium text-on-surface outline-none bg-transparent w-full"/>
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-xl border border-outline/20 shadow-sm">
        <p className="px-4 pt-3 pb-0.5 text-[9px] font-black text-on-surface-variant/50 tracking-[0.15em] uppercase">Visibility</p>
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            {visibility === 'private'
              ? <LockIcon className="w-3.5 h-3.5 text-primary"/>
              : <GlobeIcon className="w-3.5 h-3.5 text-on-surface-variant"/>}
            <span className="text-sm font-medium text-on-surface">{visibility === 'private' ? 'Private' : 'Public'}</span>
          </div>
          <button type="button" onClick={() => setVisibility(v => v === 'private' ? 'public' : 'private')}
            className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${visibility === 'private' ? 'bg-primary' : 'bg-outline-variant'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-transform duration-200 ${visibility === 'private' ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}/>
          </button>
        </div>
      </div>

      {/* Encryption */}
      <div className="bg-white rounded-xl border border-outline/20 shadow-sm">
        <p className="px-4 pt-3 pb-0.5 text-[9px] font-black text-on-surface-variant/50 tracking-[0.15em] uppercase">Encryption</p>
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <LockIcon className={`w-3.5 h-3.5 ${isEncrypted ? 'text-primary' : 'text-on-surface-variant'}`}/>
            <span className="text-sm font-medium text-on-surface">{isEncrypted ? 'Encrypted' : 'Plain Text'}</span>
          </div>
          <button type="button" onClick={() => setIsEncrypted(p => !p)}
            className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${isEncrypted ? 'bg-primary' : 'bg-outline-variant'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-transform duration-200 ${isEncrypted ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}/>
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl border border-outline/20 shadow-sm">
        <p className="px-4 pt-3 pb-0.5 text-[9px] font-black text-on-surface-variant/50 tracking-[0.15em] uppercase">Tags</p>
        <div className="px-4 pb-3 flex flex-col gap-2">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <span key={i} className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="opacity-50 hover:opacity-100 font-bold">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 bg-surface-variant/50 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary/30">
            <TagIcon className="w-3 h-3 text-outline-variant flex-shrink-0"/>
            <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)}
              onKeyDown={handleAddTag} placeholder="Add tag, press Enter"
              className="text-xs text-on-surface outline-none bg-transparent w-full placeholder:text-outline-variant/50"/>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-outline/20 shadow-sm">
        <p className="px-4 pt-3 pb-0.5 text-[9px] font-black text-on-surface-variant/50 tracking-[0.15em] uppercase">Stats</p>
        <div className="px-4 pb-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-on-surface-variant">Words</span>
            <span className="text-xs font-bold text-on-surface tabular-nums">{wordCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-on-surface-variant">Read time</span>
            <span className="text-xs font-bold text-on-surface flex items-center gap-1">
              <ClockIcon className="w-3 h-3 text-outline-variant"/>{readTime} min
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-0.5">
        <button type="button" onClick={() => handleSave()} disabled={isSaving}
          className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {isSaving
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</>
            : 'Save Entry'}
        </button>
        {visibility === 'public' && isEditing && (
          <button type="button" onClick={handleShare}
            className="w-full py-2 rounded-xl text-[13px] font-semibold text-primary/70 hover:bg-primary/6 hover:text-primary transition-all flex items-center justify-center gap-1.5">
            <Share2 className="w-3.5 h-3.5"/> Copy Share Link
          </button>
        )}
        <button type="button" onClick={handleTrash}
          className="w-full py-2 rounded-xl text-[13px] font-semibold text-error/70 hover:bg-error/8 hover:text-error active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
          <TrashIcon className="w-3.5 h-3.5"/> {isEditing ? 'Delete Entry' : 'Discard'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-hidden flex flex-col font-sans bg-[#F4F5FA]">

      {/* ── SAVE TOAST ── */}
      {showSaved && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white px-5 py-2.5 rounded-full shadow-elevated flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckIcon className="w-4 h-4"/> <span className="text-sm font-bold">Entry saved!</span>
        </div>
      )}

      {/* ── MOBILE TOOLBAR ── */}
      <div className="lg:hidden flex-shrink-0 bg-white border-b border-outline/10 px-4 py-2.5 flex items-center justify-between gap-3">
        <button onClick={() => navigate('/entries')} className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
          <ChevronLeft className="w-5 h-5"/>
        </button>

        {/* Format tools */}
        <div className="flex items-center gap-0.5 bg-surface-variant/50 rounded-full px-2 py-1 flex-1 justify-center">
          {formatBtns.map((btn, i) =>
            btn === null
              ? <div key={`sep-${i}`} className="w-px h-3.5 bg-outline/40 mx-1"/>
              : <button key={i} type="button" onClick={btn.fn} title={btn.title}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${btn.active ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white hover:shadow-sm'}`}>
                  {btn.icon}
                </button>
          )}
        </div>

        <button onClick={() => setShowMeta(true)}
          className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors flex items-center gap-1">
          <SlidersHorizontal className="w-4.5 h-4.5"/>
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-hidden flex flex-row">

        {/* EDITOR CANVAS */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Desktop pinned header */}
          <div className="hidden lg:flex flex-shrink-0 items-center justify-between px-6 py-2.5 bg-white border-b border-outline/15 z-10">
            <div className="flex items-center gap-2.5">
              <button onClick={() => navigate('/entries')}
                className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
                <ChevronLeft className="w-4 h-4"/>
              </button>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest uppercase ${isEditing ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-variant text-primary/80'}`}>
                {isEditing ? 'Saved' : 'Draft'}
              </span>
              {lastSaved && (
                <span className="text-[11px] text-on-surface-variant/60 flex items-center gap-1">
                  <CheckIcon className="w-3 h-3"/>
                  {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            {/* Format toolbar */}
            <div className="flex items-center gap-0.5 bg-surface-variant/50 rounded-full px-2 py-1">
              {formatBtns.map((btn, i) =>
                btn === null
                  ? <div key={`sep-${i}`} className="w-px h-3.5 bg-outline/40 mx-1"/>
                  : <button key={i} type="button" onClick={btn.fn} title={btn.title}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${btn.active ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white hover:shadow-sm'}`}>
                      {btn.icon}
                    </button>
              )}
            </div>
            {/* Share */}
            {visibility === 'public' && isEditing && (
              <button onClick={handleShare} title="Copy Share Link"
                className="w-8 h-8 rounded-full bg-white border border-outline/20 shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
                <Share2 className="w-3.5 h-3.5"/>
              </button>
            )}
          </div>

          {/* Writing area */}
          <div className="flex-1 overflow-y-auto bg-white lg:m-5 lg:rounded-2xl lg:border lg:border-outline/20 lg:shadow-sm">
            <div className="px-5 pt-5 pb-3 sm:px-8 sm:pt-7">
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Untitled Entry"
                className="w-full text-[22px] sm:text-[26px] font-semibold text-on-surface bg-transparent border-none outline-none mb-4 placeholder:text-outline-variant/40 tracking-tight leading-snug"
              />
              <div className="relative text-[16px]">
                {!editor?.getText().trim() && (
                  <p className="absolute top-0 left-0 text-outline-variant/40 pointer-events-none select-none m-0">
                    Start writing your thoughts...
                  </p>
                )}
                <EditorContent editor={editor}/>
              </div>
            </div>
          </div>

          {/* Mobile bottom save bar */}
          <div className="lg:hidden flex-shrink-0 bg-white border-t border-outline/10 px-4 py-3 flex gap-3">
            <button type="button" onClick={() => handleSave()} disabled={isSaving}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {isSaving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</> : 'Save Entry'}
            </button>
            <button type="button" onClick={handleTrash}
              className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-error/70 hover:bg-error/8 hover:text-error active:scale-[0.98] transition-all flex items-center gap-1.5 border border-error/15">
              <TrashIcon className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>

        {/* DESKTOP RIGHT SIDEBAR */}
        <div className="hidden lg:flex w-[260px] flex-shrink-0 flex-col overflow-y-auto pb-6 gap-4 py-5 pr-5">
          <MetaPanel/>
        </div>
      </div>

      {/* ── MOBILE METADATA DRAWER ── */}
      {showMeta && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMeta(false)}/>
          {/* Sheet */}
          <div className="relative w-full bg-[#F4F5FA] rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl border-b border-outline/10 sticky top-0">
              <h3 className="text-[15px] font-black text-on-surface tracking-tight">Entry Settings</h3>
              <button onClick={() => setShowMeta(false)} className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <MetaPanel/>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryEditor;
