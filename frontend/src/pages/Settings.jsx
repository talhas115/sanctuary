import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Download, 
  Palette, 
  FileText, 
  Code,
  Sun,
  Moon,
  Check,
  LogOut,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import api from '../services/api';

/**
 * Stitch Settings UI - Replicated exactly as a card-based dashboard.
 * Corrected: API routes mapped correctly to backend AuthController.
 * Added: Conditional password visibility (hidden by default).
 */

const Settings = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  // Local states for inputs
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [defaultEncryption, setDefaultEncryption] = useState(user?.defaultEncryption || false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false); // Visibility of text inside input
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false); // Toggle the whole password field
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [exportLoading, setExportLoading] = useState(null); // 'pdf' or 'html'
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Auto-clear feedback after 4 seconds
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle Profile Update
  const handleSaveProfile = async () => {
    if (!displayName || !email) {
      showFeedback('error', 'Name and Email are required.');
      return;
    }
    
    setIsSaving(true);
    try {
      // Backend: AuthController [Route("api/[controller]")] + [HttpPut("profile")] -> /api/auth/profile
      await api.put('/auth/profile', { displayName, email, defaultEncryption });
      updateUser({ displayName, email, defaultEncryption });
      showFeedback('success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile', err);
      showFeedback('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showFeedback('error', 'Password must be at least 6 characters.');
      return;
    }
    
    setIsChangingPass(true);
    try {
      // Backend: AuthController [Route("api/[controller]")] + [HttpPost("change-password")] -> /api/auth/change-password
      await api.post('/auth/change-password', { newPassword });
      setNewPassword('');
      setIsPasswordFormOpen(false);
      showFeedback('success', 'Password updated successfully!');
    } catch (err) {
      console.error('Failed to change password', err);
      showFeedback('error', err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Handle Journal Export
  const handleExport = async (format) => {
    setExportLoading(format);
    try {
      // Backend: ExportController [Route("api/[controller]")] -> api/export
      const response = await api.get(`/export?format=${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_journal_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showFeedback('success', `Export as ${format.toUpperCase()} complete!`);
    } catch (err) {
      console.error(`Failed to export as ${format}`, err);
      showFeedback('error', `Failed to export as ${format.toUpperCase()}.`);
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-10 lg:px-12 bg-[#F9FAFB] animate-in fade-in duration-700 relative">
      
      {/* ── GLOBAL FEEDBACK POPUP ── */}
      {feedback && (
        <div className={`fixed top-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-elevated border animate-in slide-in-from-top-4 duration-300 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-sm tracking-tight">{feedback.message}</span>
        </div>
      )}

      <div className="w-full max-w-[900px] mx-auto space-y-8 pb-20">
        
        <header className="mb-10">
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Settings</h1>
          <p className="text-on-surface-variant text-[16px]">Customize your sanctuary experience.</p>
        </header>

        {/* ── 1. ACCOUNT INFO SECTION ── */}
        <section className="bg-white rounded-[24px] border border-outline/30 shadow-subtle p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                {displayName.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-on-surface leading-tight">{displayName || 'Journal User'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-on-surface-variant">{email}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black tracking-widest uppercase border border-amber-100">
                    Premium Member
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2.5 rounded-full hover:bg-error/5 text-error/60 hover:text-error transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-on-surface-variant/50 tracking-widest uppercase px-1">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-surface-variant/30 border border-outline/10 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-medium outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-on-surface-variant/50 tracking-widest uppercase px-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-surface-variant/30 border border-outline/10 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-medium outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-primary text-white px-8 py-3.5 rounded-full font-bold shadow-sm hover:shadow-elevated transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </section>

        {/* ── 2. SECURITY SECTION ── */}
        <section className="bg-white rounded-[24px] border border-outline/30 shadow-subtle p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-[18px] font-bold text-on-surface">Security</h3>
              <p className="text-[14px] text-on-surface-variant">Update your account password regularly.</p>
            </div>
            <button 
              onClick={() => setIsPasswordFormOpen(!isPasswordFormOpen)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full border border-outline text-[13px] font-bold text-on-surface hover:bg-surface-variant transition-all ${isPasswordFormOpen ? 'bg-surface-variant' : ''}`}
            >
              Update Password
              {isPasswordFormOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {isPasswordFormOpen && (
            <div className="mt-8 bg-surface-variant/20 p-6 rounded-2xl border border-outline/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-on-surface-variant/50 tracking-widest uppercase px-1">New Password</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <input 
                      type={showPasswordText ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full h-12 bg-white px-5 pr-12 rounded-xl border border-outline/20 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-medium outline-none"
                    />
                    <button 
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button 
                    onClick={handleChangePassword}
                    disabled={isChangingPass || !newPassword}
                    className="bg-on-surface text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-30 whitespace-nowrap"
                  >
                    {isChangingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Update'}
                  </button>
                </div>
                <p className="text-[11px] text-on-surface-variant/60 px-1 italic">Min. 6 characters required.</p>
              </div>
            </div>
          )}

          {/* ── NEW: ENCRYPTION PREFERENCE TOGGLE ── */}
          <div className="mt-8 pt-8 border-t border-outline/10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${defaultEncryption ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant/60'}`}>
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-on-surface">Auto-Encrypt New Entries</h4>
                <p className="text-[13px] text-on-surface-variant leading-tight max-w-[400px]">
                  When enabled, all new journal entries will default to client-side encryption.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setDefaultEncryption(!defaultEncryption)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${defaultEncryption ? 'bg-primary' : 'bg-outline/30'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${defaultEncryption ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        {/* ── 3. PREFERENCES SECTION ── */}
        <section className="bg-white rounded-[24px] border border-outline/30 shadow-subtle p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-[16px] font-bold text-on-surface">Appearance</h3>
              <p className="text-[14px] text-on-surface-variant">Choose your preferred visual theme.</p>
            </div>
            
            <div className="flex items-center bg-surface-variant/50 rounded-full p-1 border border-outline/10">
              <button 
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${theme === 'light' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button 
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${theme === 'dark' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
            </div>
          </div>
        </section>

        {/* ── 4. DATA & PRIVACY SECTION ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[24px] border border-outline/30 shadow-subtle p-7 flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-[16px] font-bold text-on-surface mb-2">Export as PDF</h4>
            <p className="text-[13px] text-on-surface-variant leading-relaxed mb-6">Download a beautiful, printable PDF version of your journal.</p>
            <button 
              onClick={() => handleExport('pdf')}
              disabled={exportLoading !== null}
              className="mt-auto w-full py-3.5 rounded-xl border border-outline text-[13px] font-bold text-on-surface hover:bg-surface-variant transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {exportLoading === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </button>
          </div>

          <div className="bg-white rounded-[24px] border border-outline/30 shadow-subtle p-7 flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Code className="w-6 h-6" />
            </div>
            <h4 className="text-[16px] font-bold text-on-surface mb-2">Export as HTML</h4>
            <p className="text-[13px] text-on-surface-variant leading-relaxed mb-6">Get a portable HTML version of your journal for web archiving.</p>
            <button 
              onClick={() => handleExport('html')}
              disabled={exportLoading !== null}
              className="mt-auto w-full py-3.5 rounded-xl border border-outline text-[13px] font-bold text-on-surface hover:bg-surface-variant transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {exportLoading === 'html' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download HTML
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
