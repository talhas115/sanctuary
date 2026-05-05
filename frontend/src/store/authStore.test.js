import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should initialize with default state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
  });

  it('should login correctly', () => {
    const mockUser = { id: 1, email: 'test@example.com', displayName: 'Tester', defaultEncryption: true };
    const mockToken = 'fake-jwt-token';
    
    useAuthStore.getState().login(mockToken, mockUser);
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(mockToken);
    expect(state.user.email).toBe(mockUser.email);
    expect(state.user.defaultEncryption).toBe(true);
  });

  it('should logout correctly', () => {
    useAuthStore.getState().login('token', { id: 1 });
    useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
  });

  it('should update user info', () => {
    useAuthStore.getState().login('token', { id: 1, displayName: 'Old' });
    useAuthStore.getState().updateUser({ displayName: 'New' });
    
    const state = useAuthStore.getState();
    expect(state.user.displayName).toBe('New');
  });
});
