import React, { useEffect } from 'react';
import { useEntryStore } from '../store/entryStore';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Zap, Tag as TagIcon, ArrowRight, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import EntryCard from '../components/EntryCard';

const Dashboard = () => {
  const { stats, streak, heatmap, entries, fetchAnalytics, fetchEntries } = useEntryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
    fetchEntries();
  }, [fetchAnalytics, fetchEntries]);

  // Generate dense heatmap grid (last 84 days = 12 weeks * 7 days)
  const generateHeatmapGrid = () => {
    const grid = [];
    const today = new Date();
    // The backend returns { countsByDate: { "YYYY-MM-DD": count } }
    const countsMap = heatmap?.countsByDate || {};

    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = countsMap[dateStr] || 0;
      
      let intensityClass = 'bg-outline-variant/20'; // 0 entries
      if (count === 1) intensityClass = 'bg-primary/30';
      if (count === 2) intensityClass = 'bg-primary/60';
      if (count >= 3) intensityClass = 'bg-primary';

      grid.push(
        <div 
          key={dateStr}
          className={`w-4 h-4 rounded-[2px] ${intensityClass} transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer`}
          title={`${dateStr}: ${count} entries`}
        />
      );
    }
    return grid;
  };

  const recentEntries = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return (
    <div className="h-full overflow-y-auto p-6 flex justify-center">
    <div className="w-full max-w-[720px] space-y-[32px] animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="flex flex-col gap-[4px]">
        <h1 className="text-3xl font-semibold text-on-surface tracking-tight">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}.
        </h1>
        <p className="text-sm text-on-surface-variant">Here is an overview of your journaling progress.</p>
      </header>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        {/* Card 1: Total Entries */}
        <div className="bg-white rounded-[16px] p-[20px] shadow-subtle flex flex-col justify-between h-[140px] border border-outline/50">
          <div className="flex items-start justify-between w-full">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-semibold">
              <TrendingUp className="w-3 h-3" /> +12%
            </div>
          </div>
          <div>
            <p className="text-[32px] font-bold text-on-surface leading-none">{stats?.totalEntries || 0}</p>
            <p className="text-[12px] uppercase text-on-surface-variant font-medium tracking-wider mt-1">Total Entries</p>
          </div>
        </div>

        {/* Card 2: Day Streak */}
        <div className="bg-white rounded-[16px] p-[20px] shadow-subtle flex flex-col justify-between h-[140px] border border-outline/50">
          <div className="flex items-start justify-between w-full">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-semibold">
              <TrendingUp className="w-3 h-3" /> +5%
            </div>
          </div>
          <div>
            <p className="text-[32px] font-bold text-on-surface leading-none">{streak || 0}</p>
            <p className="text-[12px] uppercase text-on-surface-variant font-medium tracking-wider mt-1">Day Streak</p>
          </div>
        </div>

        {/* Card 3: Tags / Categories */}
        <div className="bg-white rounded-[16px] p-[20px] shadow-subtle flex flex-col justify-between h-[140px] border border-outline/50">
          <div className="flex items-start justify-between w-full">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <TagIcon className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-semibold">
              <TrendingUp className="w-3 h-3" /> +2
            </div>
          </div>
          <div>
            <p className="text-[32px] font-bold text-on-surface leading-none">{stats?.totalTags || 0}</p>
            <p className="text-[12px] uppercase text-on-surface-variant font-medium tracking-wider mt-1">Tags / Categories</p>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <section className="bg-white p-[24px] rounded-[16px] shadow-subtle border border-outline/50">
        <div className="flex items-center justify-between mb-[20px]">
          <div>
            <h2 className="text-xl font-semibold text-on-surface">Consistency</h2>
            <p className="text-sm text-on-surface-variant mt-[2px]">Your writing activity over time.</p>
          </div>
          <div className="flex items-center gap-[4px] text-[12px] text-on-surface-variant font-medium">
            <span>LESS</span>
            <div className="w-3 h-3 rounded-[2px] bg-outline-variant/20 ml-1"></div>
            <div className="w-3 h-3 rounded-[2px] bg-primary/30"></div>
            <div className="w-3 h-3 rounded-[2px] bg-primary/60"></div>
            <div className="w-3 h-3 rounded-[2px] bg-primary mr-1"></div>
            <span>MORE</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-[4px]">
          {generateHeatmapGrid()}
        </div>
      </section>

      {/* Recent Entries Section */}
      <section>
        <div className="flex items-center justify-between mb-[16px]">
          <h2 className="text-xl font-semibold text-on-surface">Recent Entries</h2>
          <Link to="/entries" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            View all entries
          </Link>
        </div>
        
        <div className="flex flex-col gap-[12px]">
          {recentEntries.length > 0 ? (
            recentEntries.map(entry => (
              <EntryCard 
                key={entry.id} 
                entry={entry} 
                onClick={() => navigate(`/entries/${entry.id}`)} 
              />
            ))
          ) : (
             <div className="bg-white p-[24px] rounded-[16px] shadow-subtle border border-outline/50 text-center">
              <p className="text-sm text-on-surface-variant italic">No recent entries found. Start writing today!</p>
             </div>
          )}
        </div>
      </section>
    </div>
    </div>
  );
};

export default Dashboard;
