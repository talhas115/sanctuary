import React, { useState } from 'react';
import {
  User,
  Lock,
  Download,
  FileText,
  Code,
  Check,
  LogOut,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const Settings = () => {
  const { user, logout, updateUser } = useAuthStore();

  const [displayName,       setDisplayName]       = useState(user?.displayName || '');
  const [email,             setEmail]             = useState(user?.email || '');
  const [defaultEncryption, setDefaultEncryption] = useState(user?.defaultEncryption || false);
  const [newPassword,       setNewPassword]       = useState('');
  const [showPasswordText,  setShowPasswordText]  = useState(false);
  const [isPasswordOpen,    setIsPasswordOpen]    = useState(false);

  const [isSaving,      setIsSaving]      = useState(false);
  const [isChangingPass,setIsChangingPass] = useState(false);
  const [exportLoading, setExportLoading] = useState(null);
  const [feedback,      setFeedback]      = useState(null);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveProfile = async () => {
    if (!displayName || !email) { showFeedback('error', 'Name and Email are required.'); return; }
    setIsSaving(true);
    try {
      await api.put('/auth/profile', { displayName, email, defaultEncryption });
      updateUser({ displayName, email, defaultEncryption });
      showFeedback('success', 'Profile updated successfully!');
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update profile.');
    } finally { setIsSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { showFeedback('error', 'Password must be at least 6 characters.'); return; }
    setIsChangingPass(true);
    try {
      await api.post('/auth/change-password', { newPassword });
      setNewPassword('');
      setIsPasswordOpen(false);
      showFeedback('success', 'Password updated successfully!');
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update password.');
    } finally { setIsChangingPass(false); }
  };

  const handleExport = async (format) => {
    setExportLoading(format);
    showFeedback('success', `Starting ${format.toUpperCase()} export…`);
    try {
      const response = await api.get(`/export?format=${format}`, { responseType: 'blob', timeout: 60000 });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_journal_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showFeedback('success', `Export as ${format.toUpperCase()} complete!`);
    } catch {
      showFeedback('error', `Failed to export as ${format.toUpperCase()}. Please try again.`);
    } finally { setExportLoading(null); }
  };

  /* Avatar initials */
  const initials = displayName.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="h-full overflow-y-auto bg-[#F4F5FA] animate-in fade-in duration-500">

      {/* ── TOAST ── */}
      {feedback && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-in slide-in-from-top-4 duration-300 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0"/> : <AlertCircle className="w-4 h-4 flex-shrink-0"/>}
          <span className="font-bold text-sm">{feedback.message}</span>
        </div>
      )}

      {/* ── HERO HEADER ── */}
      <div
        className="relative overflow-hidden px-6 py-8 lg:px-12 lg:py-10"
        style={{ background: 'linear-gradient(135deg, #2A2DC0 0%, #4648D4 55%, #7B6EF5 100%)' }}
      >
        {/* Dot texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}/>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)' }}/>

        <div className="relative z-10 flex items-center gap-5">
          {/* Avatar */}
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white/55 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Your Account</p>
            <h1 className="text-white text-[22px] lg:text-[28px] font-black tracking-tight truncate">{displayName || 'Journal User'}</h1>
            <p className="text-white/55 text-[13px] truncate">{email}</p>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="ml-auto flex-shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[12px] font-bold px-4 py-2 rounded-full transition-all"
          >
            <LogOut className="w-3.5 h-3.5"/>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[860px] mx-auto px-5 py-8 lg:px-8 lg:py-10 space-y-6 pb-20">

        {/* ── 1. PROFILE ── */}
        <section className="bg-white rounded-2xl border border-outline/20 shadow-sm overflow-hidden">
          {/* Section label */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-outline/10">
            <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
              <User className="w-4 h-4 text-primary"/>
            </div>
            <div>
              <h2 className="text-[14px] font-black text-on-surface">Profile</h2>
              <p className="text-[12px] text-on-surface-variant/60">Update your display name and email.</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant/50 tracking-widest uppercase">Display Name</label>
                <input
                  type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F4F5FA] border border-outline/15 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-medium outline-none text-[14px]"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant/50 tracking-widest uppercase">Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F4F5FA] border border-outline/15 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-medium outline-none text-[14px]"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile} disabled={isSaving}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Check className="w-3.5 h-3.5"/>}
                Save Profile
              </button>
            </div>
          </div>
        </section>

        {/* ── 2. SECURITY ── */}
        <section className="bg-white rounded-2xl border border-outline/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-outline/10">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-rose-500"/>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[14px] font-black text-on-surface">Security</h2>
              <p className="text-[12px] text-on-surface-variant/60">Manage your password and encryption preferences.</p>
            </div>
            <button
              onClick={() => setIsPasswordOpen(v => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[12px] font-bold transition-all flex-shrink-0 ${isPasswordOpen ? 'bg-surface-variant border-outline/20 text-on-surface' : 'border-outline/20 text-on-surface-variant hover:border-primary/30 hover:text-primary'}`}
            >
              Change Password
              {isPasswordOpen ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
            </button>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Password form */}
            {isPasswordOpen && (
              <div className="bg-[#F4F5FA] rounded-xl p-5 border border-outline/10 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <label className="text-[10px] font-black text-on-surface-variant/50 tracking-widest uppercase">New Password</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full h-11 bg-white px-4 pr-11 rounded-xl border border-outline/20 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-medium outline-none text-[14px]"
                    />
                    <button
                      onClick={() => setShowPasswordText(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                  <button
                    onClick={handleChangePassword} disabled={isChangingPass || !newPassword}
                    className="h-11 px-6 bg-on-surface text-white rounded-xl text-[13px] font-bold hover:bg-black transition-all disabled:opacity-30 whitespace-nowrap flex items-center gap-2"
                  >
                    {isChangingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : null}
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Encryption toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${defaultEncryption ? 'bg-primary/10' : 'bg-surface-variant'}`}>
                  <Lock className={`w-4 h-4 ${defaultEncryption ? 'text-primary' : 'text-on-surface-variant/50'}`}/>
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-on-surface">Auto-Encrypt New Entries</p>
                  <p className="text-[12px] text-on-surface-variant/60 leading-tight">New entries will default to client-side encryption.</p>
                </div>
              </div>
              <button
                onClick={() => setDefaultEncryption(v => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${defaultEncryption ? 'bg-primary' : 'bg-outline/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${defaultEncryption ? 'translate-x-6' : 'translate-x-1'}`}/>
              </button>
            </div>
          </div>
        </section>

        {/* ── 3. DATA EXPORT ── */}
        <section className="bg-white rounded-2xl border border-outline/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-outline/10">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Download className="w-4 h-4 text-indigo-500"/>
            </div>
            <div>
              <h2 className="text-[14px] font-black text-on-surface">Export Journal</h2>
              <p className="text-[12px] text-on-surface-variant/60">Download your entire journal in your preferred format.</p>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PDF */}
              <div className="flex items-center gap-4 p-5 rounded-xl border border-outline/15 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <FileText className="w-5 h-5 text-indigo-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-on-surface">PDF Export</p>
                  <p className="text-[12px] text-on-surface-variant/60">Printable, beautifully formatted</p>
                </div>
                <button
                  onClick={() => handleExport('pdf')} disabled={exportLoading !== null}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-full text-[12px] font-bold hover:bg-indigo-700 transition-all disabled:opacity-40 flex-shrink-0"
                >
                  {exportLoading === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Download className="w-3.5 h-3.5"/>}
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>

              {/* HTML */}
              <div className="flex items-center gap-4 p-5 rounded-xl border border-outline/15 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <Code className="w-5 h-5 text-emerald-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-on-surface">HTML Export</p>
                  <p className="text-[12px] text-on-surface-variant/60">Portable web archive format</p>
                </div>
                <button
                  onClick={() => handleExport('html')} disabled={exportLoading !== null}
                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-full text-[12px] font-bold hover:bg-emerald-700 transition-all disabled:opacity-40 flex-shrink-0"
                >
                  {exportLoading === 'html' ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Download className="w-3.5 h-3.5"/>}
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. DANGER ZONE ── */}
        <section className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-rose-100/60">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-rose-500"/>
            </div>
            <div>
              <h2 className="text-[14px] font-black text-on-surface">Session</h2>
              <p className="text-[12px] text-on-surface-variant/60">Sign out of your account.</p>
            </div>
          </div>
          <div className="px-6 py-5 flex items-center justify-between gap-4">
            <p className="text-[13px] text-on-surface-variant/70 leading-relaxed">
              You will be redirected to the login page. Your data is safely stored.
            </p>
            <button
              onClick={logout}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-rose-200 text-rose-600 text-[13px] font-bold hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5"/> Sign Out
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;
