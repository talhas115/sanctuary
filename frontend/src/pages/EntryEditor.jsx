import React, { useState, useEffect, useCallback } from 'react';
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
  Share2, Sun, Moon
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';


const EntryEditor = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { getEntryById, addEntry, updateEntry, deleteEntry } = useEntryStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();


  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [isEncrypted, setIsEncrypted] = useState(!isEditing ? (user?.defaultEncryption || false) : false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  // Forces re-render on every TipTap transaction so isActive() reflects current state immediately
  const [, forceUpdate] = useState(0);

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
    onTransaction: () => { forceUpdate(n => n + 1); },
    editorProps: {
      attributes: { class: 'focus:outline-none min-h-[400px] text-[16px] leading-8 text-on-surface/90' }
    }
  });

  // Fetch metadata (title, tags, visibility, date) independently from editor readiness
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

  // Set editor content once editor instance becomes available
  useEffect(() => {
    if (!isEditing || !editor) return;
    const fetchAndSetContent = async () => {
      const entry = await getEntryById(id);
      if (entry && editor) editor.commands.setContent(entry.content || '');
    };
    fetchAndSetContent();
  }, [editor]);

  const handleSave = async () => {
    if (!title.trim() && !editor?.getText().trim()) return;
    setIsSaving(true);
    try {
      let rawContent = editor.getHTML();
      let finalContent = isEncrypted ? encryptContent(rawContent) : rawContent;
      const payload = { 
        title, 
        content: finalContent, 
        visibility, 
        isEncrypted, 
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
      setShowSaveMessage(true);
      setTimeout(() => { setShowSaveMessage(false); navigate('/entries'); }, 1500);
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleTrash = async () => {
    if (!isEditing) { navigate('/entries'); return; }
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await api.delete(`/entries/${id}`);
      deleteEntry(id);
      navigate('/entries');
    }
  };

  const handleShare = async () => {
    if (!isEditing) return;
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

  const handleAddTag = (e) => {

    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (t) => setTags(tags.filter(tag => tag !== t));
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    /* Full viewport height, no outer scroll — only inner content area scrolls */
    <div className="h-full overflow-hidden flex justify-center px-6 py-5 font-sans">
      
      {showSaveMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white px-6 py-3 rounded-full shadow-elevated flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckIcon className="w-4 h-4" />
          <span className="text-sm font-bold">Entry saved!</span>
        </div>
      )}

      <div className="flex w-full max-w-[1020px] gap-5 h-full">

        {/* ══════════════ CENTER WRITING CANVAS ══════════════
            flex-col card: header row is PINNED, content scrolls */}
        <div
          className="flex-1 flex flex-col bg-white rounded-2xl border border-outline/20 shadow-sm overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 128px)' }}
        >
          {/* ── PINNED HEADER — always visible ── */}
          <div className="flex-shrink-0 flex items-center justify-between px-7 py-2.5 border-b border-outline/15 bg-white z-10">
            {/* Left: status badge + timestamp */}
            <div className="flex items-center gap-2.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest uppercase ${
                isEditing ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-variant text-primary/80'
              }`}>
                {isEditing ? 'Saved' : 'Draft'}
              </span>
              {lastSaved && (
                <span className="text-[11px] text-on-surface-variant/60 flex items-center gap-1">
                  <CheckIcon className="w-3 h-3" />
                  {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* Right: toolbar capsule + page actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 bg-surface-variant/50 rounded-full px-2 py-1">
                {[
                  { action: () => editor.chain().focus().toggleBold().run(), active: editor?.isActive('bold'), icon: <BoldIcon className="w-[14px] h-[14px]" />, title: 'Bold' },
                  { action: () => editor.chain().focus().toggleItalic().run(), active: editor?.isActive('italic'), icon: <ItalicIcon className="w-[14px] h-[14px]" />, title: 'Italic' },
                  { action: () => editor.chain().focus().toggleUnderline().run(), active: editor?.isActive('underline'), icon: <UnderlineLucide className="w-[14px] h-[14px]" />, title: 'Underline' },
                ].map((btn, i) => (
                  <button key={i} type="button" onClick={btn.action} title={btn.title}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      btn.active ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white hover:shadow-sm'
                    }`}>
                    {btn.icon}
                  </button>
                ))}
                <div className="w-px h-3.5 bg-outline/40 mx-1" />
                {[
                  { action: () => editor.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList'), icon: <ListIcon className="w-[14px] h-[14px]" />, title: 'Bullets' },
                  { action: () => editor.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList'), icon: <ListOrderedIcon className="w-[14px] h-[14px]" />, title: 'Numbers' },
                ].map((btn, i) => (
                  <button key={i} type="button" onClick={btn.action} title={btn.title}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      btn.active ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white hover:shadow-sm'
                    }`}>
                    {btn.icon}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  className="w-8 h-8 rounded-full bg-white border border-outline/20 shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
                  {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                </button>
                {visibility === 'public' && isEditing && (
                  <button onClick={handleShare} title="Share Public Link"
                    className="w-8 h-8 rounded-full bg-white border border-outline/20 shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>


          </div>

          {/* ── SCROLLABLE CONTENT ── */}
          <div className="flex-1 overflow-y-auto px-10 py-7">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Entry"
              className="w-full text-[26px] font-semibold text-on-surface bg-transparent border-none outline-none mb-5 placeholder:text-outline-variant/40 tracking-tight leading-snug"
            />
            <div className="relative text-[16px]">
              {!editor?.getText().trim() && (
                <p className="absolute top-0 left-0 text-outline-variant/40 pointer-events-none select-none m-0">
                  Start writing your thoughts...
                </p>
              )}
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* ══════════════ RIGHT METADATA PANEL ══════════════ */}
        <div
          className="w-[260px] flex-shrink-0 flex flex-col gap-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 128px)' }}
        >

          {/* ENTRY DATE */}
          <div className="bg-white rounded-xl border border-outline/20 shadow-sm">
            <p className="px-4 pt-3 pb-0.5 text-[9px] font-black text-on-surface-variant/50 tracking-[0.15em] uppercase">Entry Date</p>
            <div className="flex items-center gap-2 px-4 pb-3">
              <CalendarIconLucide className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)}
                className="text-sm font-medium text-on-surface outline-none bg-transparent w-full" />
            </div>
          </div>

          {/* VISIBILITY */}
          <div className="bg-white rounded-xl border border-outline/20 shadow-sm">
            <p className="px-4 pt-3 pb-0.5 text-[9px] font-black text-on-surface-variant/50 tracking-[0.15em] uppercase">Visibility</p>
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                {visibility === 'private'
                  ? <LockIcon className="w-3.5 h-3.5 text-primary" />
                  : <GlobeIcon className="w-3.5 h-3.5 text-on-surface-variant" />}
                <span className="text-sm font-medium text-on-surface">{visibility === 'private' ? 'Private' : 'Public'}</span>
              </div>
              <button type="button" onClick={() => setVisibility(v => v === 'private' ? 'public' : 'private')}
                className={`w-9 h-[20px] rounded-full relative transition-colors duration-200 ${visibility === 'private' ? 'bg-primary' : 'bg-outline-variant'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-transform duration-200 ${visibility === 'private' ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>
          </div>

          {/* ENCRYPTION */}
          <div className="bg-white rounded-xl border border-outline/20 shadow-sm">
            <p className="px-4 pt-3 pb-0.5 text-[9px] font-black text-on-surface-variant/50 tracking-[0.15em] uppercase">Encryption</p>
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                <LockIcon className={`w-3.5 h-3.5 ${isEncrypted ? 'text-primary' : 'text-on-surface-variant'}`} />
                <span className="text-sm font-medium text-on-surface">{isEncrypted ? 'Encrypted' : 'Plain Text'}</span>
              </div>
              <button type="button" onClick={() => setIsEncrypted(p => !p)}
                className={`w-9 h-[20px] rounded-full relative transition-colors duration-200 ${isEncrypted ? 'bg-primary' : 'bg-outline-variant'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-transform duration-200 ${isEncrypted ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>
          </div>

          {/* TAGS */}
          <div className="bg-white rounded-xl border border-outline/20 shadow-sm">
            <p className="px-4 pt-3 pb-0.5 text-[9px] font-black text-on-surface-variant/50 tracking-[0.15em] uppercase">Tags</p>
            <div className="px-4 pb-3 flex flex-col gap-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, i) => (
                    <span key={i} className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="opacity-50 hover:opacity-100 hover:text-error transition-all font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 bg-surface-variant/50 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary/30">
                <TagIcon className="w-3 h-3 text-outline-variant flex-shrink-0" />
                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag} placeholder="Add tag, press Enter"
                  className="text-xs text-on-surface outline-none bg-transparent w-full placeholder:text-outline-variant/50" />
              </div>
            </div>
          </div>

          {/* STATS */}
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
                  <ClockIcon className="w-3 h-3 text-outline-variant" />{readTime} min
                </span>
              </div>
            </div>
          </div>



          {/* ACTIONS */}
          <div className="space-y-2 pt-0.5">
            <button type="button" onClick={handleSave} disabled={isSaving}
              className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {isSaving
                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : 'Save Entry'}
            </button>
            <button type="button" onClick={handleTrash}
              className="w-full py-2 rounded-xl text-[13px] font-semibold text-error/70 hover:bg-error/8 hover:text-error active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
              <TrashIcon className="w-3.5 h-3.5" />
              Move to Trash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryEditor;
