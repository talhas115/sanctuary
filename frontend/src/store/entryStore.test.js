import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEntryStore } from './entryStore';

// Mock the API and Crypto utils
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../utils/crypto', () => ({
  decryptContent: vi.fn((content) => `DECRYPTED: ${content}`)
}));

describe('entryStore', () => {
  beforeEach(() => {
    // Reset state manually if needed, or rely on create fresh if possible
    // Zustand stores persist state in memory during tests, so we reset:
    useEntryStore.setState({ entries: [], stats: null, streak: 0, heatmap: [] });
  });

  it('should add an entry', () => {
    const mockEntry = { id: '1', title: 'Test' };
    useEntryStore.getState().addEntry(mockEntry);
    expect(useEntryStore.getState().entries).toHaveLength(1);
    expect(useEntryStore.getState().entries[0].title).toBe('Test');
  });

  it('should update an entry', () => {
    useEntryStore.setState({ entries: [{ id: '1', title: 'Old' }] });
    useEntryStore.getState().updateEntry({ id: '1', title: 'New' });
    expect(useEntryStore.getState().entries[0].title).toBe('New');
  });

  it('should delete an entry', () => {
    useEntryStore.setState({ entries: [{ id: '1' }, { id: '2' }] });
    useEntryStore.getState().deleteEntry('1');
    expect(useEntryStore.getState().entries).toHaveLength(1);
    expect(useEntryStore.getState().entries[0].id).toBe('2');
  });
});
