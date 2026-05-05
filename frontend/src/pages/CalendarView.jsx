import React, { useEffect, useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Clock, 
  Tag, 
  Calendar as CalendarIcon,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEntryStore } from '../store/entryStore';

/**
 * Stitch Calendar UI - Replicated exactly as per "Serene Narrative" Design System.
 * Features a split-view Calendar Grid (Left) + Timeline Panel (Right).
 */

const CalendarView = () => {
  const navigate = useNavigate();
  const { entries, fetchEntries, isLoading } = useEntryStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimeline, setShowTimeline] = useState(false); // Default to false on mobile

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Helper: Get entries for a specific day
  const getEntriesForDate = (date) => {
    const dStr = date.toISOString().split('T')[0];
    return entries.filter(e => {
      const entryDate = new Date(e.createdAt).toISOString().split('T')[0];
      return entryDate === dStr;
    });
  };

  const selectedEntries = useMemo(() => getEntriesForDate(selectedDate), [selectedDate, entries]);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  const entriesThisMonthCount = useMemo(() => {
    return entries.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
  }, [entries, month, year]);

  const calendarDays = useMemo(() => {
    const days = [];
    // Padding for first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ type: 'empty' });
    }
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const dayEntries = getEntriesForDate(date);
      days.push({ 
        day: d, 
        date, 
        isToday, 
        isSelected, 
        entries: dayEntries,
        type: 'day'
      });
    }
    return days;
  }, [year, month, selectedDate, entries]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-700">
      
      {/* ── LEFT SIDE: CALENDAR GRID ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 flex flex-col items-center">
        <div className="w-full max-w-[800px] bg-white rounded-[24px] shadow-subtle border border-outline/30 p-4 md:p-8">
          
          {/* Header */}
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-[22px] md:text-[28px] font-bold text-on-surface tracking-tight leading-tight">
                {monthName} {year}
              </h1>
              <p className="text-[12px] md:text-[14px] text-on-surface-variant font-medium mt-1">
                {entriesThisMonthCount} memories captured
              </p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={handleGoToToday}
                className="px-3 md:px-4 py-1.5 rounded-full border border-outline text-[11px] md:text-[13px] font-bold text-on-surface hover:bg-surface-variant transition-all"
              >
                Today
              </button>
              <div className="flex items-center bg-surface-variant/50 rounded-full p-1">
                <button onClick={handlePrevMonth} className="p-1 md:p-1.5 text-on-surface-variant hover:text-primary transition-colors">
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="w-px h-3 bg-outline/50 mx-1" />
                <button onClick={handleNextMonth} className="p-1 md:p-1.5 text-on-surface-variant hover:text-primary transition-colors">
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Grid Headers */}
          <div className="grid grid-cols-7 mb-4">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center text-[11px] font-black text-on-surface-variant/40 tracking-[0.1em]">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, i) => {
              if (item.type === 'empty') return <div key={`empty-${i}`} className="aspect-square" />;
              
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(item.date); setShowTimeline(true); }}
                  className={`
                    aspect-square rounded-[14px] flex flex-col items-center justify-center relative transition-all group
                    ${item.isSelected ? 'bg-primary text-white shadow-elevated z-10 scale-[1.05]' : 'hover:bg-surface-variant/70 text-on-surface'}
                    ${item.isToday && !item.isSelected ? 'bg-primary/5 text-primary ring-1 ring-primary/20' : ''}
                  `}
                >
                  <span className={`text-[16px] font-bold ${item.isSelected ? 'text-white' : ''}`}>
                    {item.day}
                  </span>
                  
                  {/* Activity Indicators (Dots) */}
                  <div className="absolute bottom-3 flex gap-0.5">
                    {item.entries.slice(0, 3).map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1 h-1 rounded-full ${item.isSelected ? 'bg-white/80' : 'bg-primary/40'}`} 
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: FLOATING TIMELINE PANEL ── */}
      <div className={`
        fixed inset-y-0 right-0 w-full md:w-[400px] md:relative z-30 transform transition-transform duration-500 ease-out
        ${showTimeline ? 'translate-x-0' : 'translate-x-full'}
        bg-background/80 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none
        p-6 flex flex-col
      `}>
        <div className="flex-1 bg-white md:bg-white/95 rounded-[24px] shadow-elevated border border-outline/30 flex flex-col overflow-hidden">
          
          {/* Timeline Header */}
          <div className="flex-shrink-0 p-6 border-b border-outline/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black text-primary tracking-[0.15em] uppercase">
                {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
              </p>
              <h2 className="text-[20px] font-bold text-on-surface">
                {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
            </div>
            <button 
              onClick={() => setShowTimeline(false)}
              className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Entry Cards List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 italic text-on-surface-variant/50">Loading timeline...</div>
            ) : selectedEntries.length > 0 ? (
              selectedEntries.map(entry => (
                <div 
                  key={entry.id}
                  onClick={() => navigate(`/entries/${entry.id}`)}
                  className="bg-surface-variant/30 rounded-[18px] p-5 border border-outline/5 hover:border-primary/20 hover:bg-white hover:shadow-subtle transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant/40" />
                    <span className="text-[11px] font-bold text-on-surface-variant/60">
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <h3 className="text-[16px] font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {entry.title || 'Untitled Entry'}
                  </h3>
                  
                  <p className="text-[14px] text-on-surface-variant/80 line-clamp-3 leading-relaxed mb-4">
                    {entry.content?.replace(/<[^>]+>/g, '') || 'No content.'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {entry.tags?.map((tag, idx) => (
                      <span key={idx} className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-on-surface-variant/70 border border-outline/10 uppercase tracking-wider">
                        {typeof tag === 'object' ? tag.name : tag}
                      </span>
                    ))}
                  </div>

                  {/* Optional Image Preview Placeholder */}
                  {entry.id === 'placeholder-with-image' && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-outline/10 h-[120px] bg-outline/5 flex items-center justify-center">
                       <ImageIcon className="w-6 h-6 text-outline/30" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-variant/40 flex items-center justify-center">
                   <CalendarIcon className="w-7 h-7 text-outline-variant/50" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-on-surface">No entries found</p>
                  <p className="text-[13px] text-on-surface-variant mt-1">Nothing captured on this day.</p>
                </div>
                <button 
                  onClick={() => navigate('/entries/new')}
                  className="bg-primary text-white px-6 py-2 rounded-full text-[13px] font-bold shadow-sm hover:shadow-elevated transition-all"
                >
                  Write Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
