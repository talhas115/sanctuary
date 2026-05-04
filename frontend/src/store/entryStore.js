import { create } from 'zustand';
import api from '../services/api';
import { decryptContent } from '../utils/crypto';

export const useEntryStore = create((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,
  
  // Dashboard Analytics Data
  stats: null,
  streak: 0,
  heatmap: [],
  isStatsLoading: false,

  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/entries');
      
      // Decrypt entries if necessary on load
      const decryptedEntries = response.data.map(entry => {
        let content = entry.content;
        if (entry.isEncrypted && content) {
          content = decryptContent(content);
        }
        
        // Calculate word count from plain text for list views
        const plainText = content?.replace(/<[^>]+>/g, '') || '';
        const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
        
        return { ...entry, content, wordCount };
      });

      set({ entries: decryptedEntries, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch entries', isLoading: false });
    }
  },

  getEntryById: async (id) => {
    // Try to find in cache first
    const cachedEntry = get().entries.find(e => e.id === id);
    if (cachedEntry) return cachedEntry;

    // Otherwise fetch
    try {
      const response = await api.get(`/entries/${id}`);
      let entry = response.data;
      if (entry.isEncrypted && entry.content) {
        entry.content = decryptContent(entry.content);
      }
      
      const plainText = entry.content?.replace(/<[^>]+>/g, '') || '';
      entry.wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
      
      return entry;
    } catch (error) {
      console.error('Failed to fetch entry detail', error);
      return null;
    }
  },

  addEntry: (entry) => set((state) => ({ 
    entries: [entry, ...state.entries] 
  })),

  updateEntry: (updatedEntry) => set((state) => ({
    entries: state.entries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    )
  })),

  deleteEntry: (id) => set((state) => ({
    entries: state.entries.filter(entry => entry.id !== id)
  })),

  fetchAnalytics: async () => {
    set({ isStatsLoading: true, error: null });
    try {
      const [statsRes, streakRes, heatmapRes] = await Promise.all([
        api.get('/analytics/stats'),
        api.get('/analytics/streak'),
        api.get('/analytics/heatmap')
      ]);
      
      set({ 
        stats: statsRes.data,
        streak: streakRes.data.currentStreak || 0,
        heatmap: heatmapRes.data,
        isStatsLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch analytics', error);
      set({ isStatsLoading: false });
    }
  }
}));
