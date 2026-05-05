/**
 * Frontend Tests: Utility Functions
 * Tests for crypto helpers and entry filtering logic
 */
import { describe, it, expect, vi } from 'vitest';

// ─── Crypto utility tests ───────────────────────────────────────────────────
// We test the module by importing it after mocking CryptoJS
vi.mock('crypto-js', () => ({
  default: {
    AES: {
      encrypt: vi.fn((content, key) => ({ toString: () => `ENC::${content}` })),
      decrypt: vi.fn((cipher, key) => ({ toString: vi.fn(() => `DEC::${cipher}`) })),
    },
    enc: { Utf8: 'utf8' },
  },
}));

import { encryptContent, decryptContent } from '../utils/crypto';

describe('crypto utilities', () => {
  it('encryptContent returns a non-empty string', () => {
    const result = encryptContent('hello world');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('decryptContent returns a string', () => {
    const result = decryptContent('some-cipher-text');
    expect(typeof result).toBe('string');
  });
});

// ─── Entry filtering logic (pure functions extracted for testability) ──────
const filterBySearch = (entries, query) => {
  if (!query.trim()) return entries;
  const q = query.toLowerCase();
  return entries.filter(
    e =>
      e.title.toLowerCase().includes(q) ||
      e.content?.replace(/<[^>]+>/g, '').toLowerCase().includes(q)
  );
};

const filterByDate = (entries, dateFilter) => {
  if (dateFilter === 'all') return entries;
  const cutoff = new Date();
  if (dateFilter === '7days') cutoff.setDate(cutoff.getDate() - 7);
  if (dateFilter === '30days') cutoff.setDate(cutoff.getDate() - 30);
  return entries.filter(e => new Date(e.createdAt) >= cutoff);
};

const filterByTag = (entries, tagFilter) => {
  if (tagFilter === 'all') return entries;
  return entries.filter(e =>
    e.tags?.some(t => (typeof t === 'object' ? t.name : t) === tagFilter)
  );
};

const sortEntries = (entries, sortBy) =>
  [...entries].sort((a, b) => {
    const d1 = new Date(a.createdAt);
    const d2 = new Date(b.createdAt);
    return sortBy === 'desc' ? d2 - d1 : d1 - d2;
  });

const MOCK_ENTRIES = [
  {
    id: '1',
    title: 'Morning Reflection',
    content: '<p>Start the day well</p>',
    tags: ['Reflection', 'Health'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: '2',
    title: 'Work Notes',
    content: '<p>Meeting with team</p>',
    tags: [{ name: 'Work' }],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: '3',
    title: 'Travel Diary',
    content: '<p>Visited the mountains</p>',
    tags: ['Travel'],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
  },
];

describe('Entry Filter Logic', () => {
  describe('filterBySearch', () => {
    it('returns all entries when query is empty', () => {
      expect(filterBySearch(MOCK_ENTRIES, '')).toHaveLength(3);
    });

    it('filters by title (case-insensitive)', () => {
      const result = filterBySearch(MOCK_ENTRIES, 'morning');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('filters by content (strips HTML tags)', () => {
      const result = filterBySearch(MOCK_ENTRIES, 'mountains');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('returns empty array for no match', () => {
      expect(filterBySearch(MOCK_ENTRIES, 'nonexistent')).toHaveLength(0);
    });
  });

  describe('filterByDate', () => {
    it('returns all entries when filter is "all"', () => {
      expect(filterByDate(MOCK_ENTRIES, 'all')).toHaveLength(3);
    });

    it('returns only entries within last 7 days', () => {
      const result = filterByDate(MOCK_ENTRIES, '7days');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('returns entries within last 30 days', () => {
      const result = filterByDate(MOCK_ENTRIES, '30days');
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toContain('1');
      expect(result.map(e => e.id)).toContain('2');
    });

    it('excludes entries older than 30 days', () => {
      const result = filterByDate(MOCK_ENTRIES, '30days');
      expect(result.map(e => e.id)).not.toContain('3');
    });
  });

  describe('filterByTag', () => {
    it('returns all entries when filter is "all"', () => {
      expect(filterByTag(MOCK_ENTRIES, 'all')).toHaveLength(3);
    });

    it('filters by string tag', () => {
      const result = filterByTag(MOCK_ENTRIES, 'Reflection');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('filters by object tag (name property)', () => {
      const result = filterByTag(MOCK_ENTRIES, 'Work');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('returns empty when tag does not match', () => {
      expect(filterByTag(MOCK_ENTRIES, 'Growth')).toHaveLength(0);
    });
  });

  describe('sortEntries', () => {
    it('sorts descending (newest first)', () => {
      const result = sortEntries(MOCK_ENTRIES, 'desc');
      expect(result[0].id).toBe('1');
      expect(result[2].id).toBe('3');
    });

    it('sorts ascending (oldest first)', () => {
      const result = sortEntries(MOCK_ENTRIES, 'asc');
      expect(result[0].id).toBe('3');
      expect(result[2].id).toBe('1');
    });

    it('does not mutate the original array', () => {
      const original = [...MOCK_ENTRIES];
      sortEntries(MOCK_ENTRIES, 'asc');
      expect(MOCK_ENTRIES[0].id).toBe(original[0].id);
    });
  });
});

// ─── Tag frequency computation ────────────────────────────────────────────
const computeQuickTags = (entries, limit = 5) => {
  const counts = {};
  entries.forEach(e =>
    e.tags?.forEach(t => {
      const name = typeof t === 'object' ? t.name : t;
      if (name) counts[name] = (counts[name] || 0) + 1;
    })
  );
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
};

describe('computeQuickTags', () => {
  it('returns top tags sorted by frequency', () => {
    const entries = [
      { tags: ['Work', 'Health'] },
      { tags: ['Work', 'Reflection'] },
      { tags: ['Work'] },
      { tags: ['Health'] },
    ];
    const result = computeQuickTags(entries);
    expect(result[0]).toBe('Work');    // 3 uses
    expect(result[1]).toBe('Health');  // 2 uses
    expect(result[2]).toBe('Reflection'); // 1 use
  });

  it('handles object tags correctly', () => {
    const entries = [{ tags: [{ name: 'Travel' }, { name: 'Travel' }] }];
    const result = computeQuickTags(entries);
    expect(result[0]).toBe('Travel');
  });

  it('respects the limit', () => {
    const entries = [{ tags: ['A', 'B', 'C', 'D', 'E', 'F'] }];
    const result = computeQuickTags(entries, 3);
    expect(result).toHaveLength(3);
  });

  it('returns empty array for entries with no tags', () => {
    const result = computeQuickTags([{ tags: [] }, {}]);
    expect(result).toHaveLength(0);
  });
});

// ─── Streak calculation logic (mirrors backend AnalyticsService) ──────────
const computeStreak = (dates) => {
  const sorted = [...new Set(dates.map(d => new Date(d).toDateString()))]
    .map(d => new Date(d))
    .sort((a, b) => a - b);

  if (sorted.length === 0) return 0;

  let tempStreak = 1;
  let currentStreak = 0;

  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const last = sorted[sorted.length - 1];
  last.setHours(0, 0, 0, 0);

  if (last.getTime() === today.getTime() || last.getTime() === yesterday.getTime()) {
    currentStreak = tempStreak;
  }

  return currentStreak;
};

describe('computeStreak', () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgoStr = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

  it('returns 0 for empty dates', () => {
    expect(computeStreak([])).toBe(0);
  });

  it('returns 1 for single entry today', () => {
    expect(computeStreak([todayStr])).toBe(1);
  });

  it('returns correct streak for consecutive days ending today', () => {
    expect(computeStreak([twoDaysAgoStr, yesterdayStr, todayStr])).toBe(3);
  });

  it('returns 0 when last entry was 2+ days ago', () => {
    const old1 = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
    const old2 = new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0];
    expect(computeStreak([old1, old2])).toBe(0);
  });

  it('deduplicates multiple entries on same day', () => {
    expect(computeStreak([todayStr, todayStr, yesterdayStr])).toBe(2);
  });
});
