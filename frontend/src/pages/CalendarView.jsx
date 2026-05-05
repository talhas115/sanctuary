import React, { useEffect, useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, X, Clock,
  Calendar as CalendarIcon, PenLine, BookOpen, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEntryStore } from '../store/entryStore';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CalendarView = () => {
  const navigate = useNavigate();
  const { entries, fetchEntries, isLoading } = useEntryStore();
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mobileTab, setMobileTab]       = useState('calendar'); // 'calendar' | 'timeline'

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build a fast lookup: "YYYY-MM-DD" → count
  const entryCountMap = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const key = new Date(e.createdAt).toISOString().split('T')[0];
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [entries]);

  const getEntriesForDate = (date) => {
    const key = date.toISOString().split('T')[0];
    return entries.filter(e => new Date(e.createdAt).toISOString().split('T')[0] === key);
  };

  const selectedEntries = useMemo(() => getEntriesForDate(selectedDate), [selectedDate, entries]);

  const entriesThisMonth = useMemo(() =>
    entries.filter(e => { const d = new Date(e.createdAt); return d.getMonth()===month && d.getFullYear()===year; }).length,
    [entries, month, year]
  );

  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date    = new Date(year, month, d);
      const key     = date.toISOString().split('T')[0];
      const count   = entryCountMap[key] || 0;
      const isToday = new Date().toDateString() === date.toDateString();
      const isSel   = selectedDate.toDateString() === date.toDateString();
      days.push({ day: d, date, isToday, isSel, count });
    }
    return days;
  }, [year, month, selectedDate, entryCountMap]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => { const t = new Date(); setCurrentDate(new Date(t.getFullYear(), t.getMonth(), 1)); setSelectedDate(t); };

  const handleDayClick = (day) => {
    setSelectedDate(day.date);
    setMobileTab('timeline');
  };

  /* ── Colour intensity for dots ── */
  const dotColor = (count, isSel) => {
    if (isSel) return '#fff';
    if (count >= 3) return '#4648D4';
    if (count === 2) return '#7B6EF5';
    return '#a5b4fc';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F4F5FA]">
      <style>{CSS}</style>

      {/* ── MOBILE TAB BAR ── */}
      <div className="cal-mobile-tabs flex-shrink-0 bg-white border-b border-outline/10 flex">
        {['calendar','timeline'].map(tab => (
          <button key={tab} onClick={() => setMobileTab(tab)}
            className={`flex-1 py-3 text-[12px] font-black uppercase tracking-widest transition-colors
              ${mobileTab===tab ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant/50'}`}>
            {tab === 'calendar' ? '📅 Calendar' : '📋 Entries'}
          </button>
        ))}
      </div>

      {/* ── MAIN SPLIT LAYOUT ── */}
      <div className="flex-1 overflow-hidden flex gap-0">

        {/* ════ LEFT: CALENDAR PANEL ════ */}
        <div className={`cal-left flex flex-col bg-white border-r border-outline/10 ${mobileTab==='calendar' ? 'cal-visible' : 'cal-hidden'}`}>

          {/* Gradient Header */}
          <div className="cal-header flex-shrink-0 relative overflow-hidden px-6 py-5"
            style={{ background: 'linear-gradient(135deg, #2A2DC0 0%, #4648D4 60%, #7B6EF5 100%)' }}>
            <div className="dots-bg"/>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">
                    {year}
                  </p>
                  <h1 className="text-white text-[26px] font-black tracking-tight leading-none">
                    {MONTHS[month]}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={goToToday}
                    className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white text-[11px] font-black rounded-full border border-white/20 transition-all">
                    Today
                  </button>
                  <div className="flex bg-white/10 rounded-full p-0.5 border border-white/20">
                    <button onClick={prevMonth} className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10">
                      <ChevronLeft className="w-4 h-4"/>
                    </button>
                    <button onClick={nextMonth} className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10">
                      <ChevronRight className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="flex gap-4">
                <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-white/70"/>
                  <div>
                    <p className="text-white/60 text-[9px] font-black uppercase tracking-wider">This Month</p>
                    <p className="text-white text-[18px] font-black leading-none">{entriesThisMonth}</p>
                  </div>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300"/>
                  <div>
                    <p className="text-white/60 text-[9px] font-black uppercase tracking-wider">Selected</p>
                    <p className="text-white text-[18px] font-black leading-none">{selectedEntries.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-3">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-black text-on-surface-variant/35 tracking-widest uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`e-${i}`}/>;
                return (
                  <button key={i} onClick={() => handleDayClick(day)}
                    className={`cal-day-cell relative flex flex-col items-center justify-center rounded-xl transition-all
                      ${day.isSel ? 'day-selected' : day.isToday ? 'day-today' : 'day-normal'}`}>
                    <span className={`text-[13px] font-bold leading-none
                      ${day.isSel ? 'text-white' : day.isToday ? 'text-primary' : 'text-on-surface'}`}>
                      {day.day}
                    </span>
                    {/* Entry dots */}
                    {day.count > 0 && (
                      <div className="flex gap-[3px] mt-1">
                        {Array.from({length: Math.min(day.count, 3)}).map((_, di) => (
                          <div key={di} className="w-1 h-1 rounded-full transition-colors"
                            style={{ background: dotColor(day.count, day.isSel) }}/>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="flex-shrink-0 border-t border-outline/10 px-5 py-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/50 font-semibold">
              <div className="w-2 h-2 rounded-full bg-primary"/>Has entries
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/50 font-semibold">
              <div className="w-2 h-2 rounded-full bg-primary/20 ring-1 ring-primary/40"/>Today
            </div>
          </div>
        </div>

        {/* ════ RIGHT: TIMELINE PANEL ════ */}
        <div className={`cal-right flex flex-col ${mobileTab==='timeline' ? 'cal-visible' : 'cal-hidden'}`}
          style={{ background: '#F4F5FA' }}>

          {/* Timeline Header */}
          <div className="flex-shrink-0 bg-white border-b border-outline/10 px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-primary tracking-[0.18em] uppercase mb-0.5">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
              <h2 className="text-[20px] font-black text-on-surface tracking-tight leading-none">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <p className="text-[12px] text-on-surface-variant/60 mt-1 font-medium">
                {selectedEntries.length === 0 ? 'No entries' : `${selectedEntries.length} ${selectedEntries.length === 1 ? 'entry' : 'entries'}`}
              </p>
            </div>
            {/* Back button on mobile */}
            <button onClick={() => setMobileTab('calendar')}
              className="cal-back-btn p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Entry List */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-on-surface-variant/40 italic text-sm">
                Loading...
              </div>
            ) : selectedEntries.length > 0 ? (
              selectedEntries.map(entry => (
                <div key={entry.id} onClick={() => navigate(`/entries/${entry.id}`)}
                  className="bg-white rounded-2xl border border-outline/20 p-5 hover:border-primary/25 hover:shadow-lg transition-all cursor-pointer group">
                  {/* Time */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock className="w-3 h-3 text-primary/50"/>
                    <span className="text-[11px] font-bold text-on-surface-variant/55">
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {entry.isEncrypted && (
                      <span className="ml-auto text-[10px] bg-primary/8 text-primary px-2 py-0.5 rounded-full font-black">
                        🔒 Encrypted
                      </span>
                    )}
                  </div>
                  {/* Title */}
                  <h3 className="text-[15px] font-bold text-on-surface group-hover:text-primary transition-colors mb-2 leading-snug">
                    {entry.title || 'Untitled Entry'}
                  </h3>
                  {/* Excerpt */}
                  <p className="text-[13px] text-on-surface-variant/70 line-clamp-2 leading-relaxed mb-3">
                    {entry.content?.replace(/<[^>]+>/g, '') || 'No content.'}
                  </p>
                  {/* Tags */}
                  {entry.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.slice(0, 4).map((tag, idx) => (
                        <span key={idx}
                          className="bg-primary/6 text-primary text-[10px] font-black px-2.5 py-0.5 rounded-full border border-primary/10 tracking-wider uppercase">
                          {typeof tag === 'object' ? tag.name : tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/6 flex items-center justify-center mb-4 border border-primary/10">
                  <CalendarIcon className="w-7 h-7 text-primary/40"/>
                </div>
                <p className="text-[15px] font-bold text-on-surface mb-1">No entries this day</p>
                <p className="text-[13px] text-on-surface-variant/55 mb-6">Nothing captured yet. Start writing!</p>
                <button onClick={() => navigate('/entries/new')}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[13px] font-bold shadow-md hover:shadow-lg hover:bg-primary/90 transition-all">
                  <PenLine className="w-4 h-4"/> Write Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── CSS ── */
const CSS = `
  /* Dots background on header */
  .dots-bg {
    position: absolute; inset: 0; opacity: 0.07;
    background-image: radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* Day cell sizing — square-ish, fits grid */
  .cal-day-cell {
    aspect-ratio: 1;
    min-width: 0;
  }
  .day-selected {
    background: linear-gradient(135deg, #4648D4, #7B6EF5);
    box-shadow: 0 4px 14px rgba(70,72,212,0.35);
    transform: scale(1.06);
    z-index: 1;
  }
  .day-today {
    background: rgba(70,72,212,0.07);
    box-shadow: inset 0 0 0 1.5px rgba(70,72,212,0.3);
  }
  .day-normal:hover {
    background: rgba(70,72,212,0.05);
  }

  /* Panel layout: desktop = 50/50, mobile = tabs */
  .cal-left  { width: 50%; flex-shrink: 0; }
  .cal-right { flex: 1; }

  /* Mobile tab visibility */
  .cal-mobile-tabs { display: none; }
  .cal-back-btn { display: none; }

  @media (max-width: 768px) {
    .cal-mobile-tabs { display: flex; }
    .cal-back-btn    { display: flex; }
    .cal-left, .cal-right { width: 100%; flex: none; }
    .cal-hidden { display: none; }
    .cal-visible { display: flex; flex-direction: column; flex: 1; }
  }

  @media (min-width: 769px) {
    .cal-left, .cal-right { display: flex !important; flex-direction: column; }
  }
`;

export default CalendarView;
