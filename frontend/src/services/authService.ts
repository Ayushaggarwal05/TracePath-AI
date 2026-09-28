import { User } from '../types/user';

export interface AuthResponse {
  status: string;
  message?: string;
  token?: string;
  user: User;
}

export interface ConnectGitHubResponse {
  status: string;
  message: string;
  github_username: string;
  repositories_imported: number;
  user: User;
}

const API_BASE = '/api/v1';

export const authService = {
  async signup(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Sign up failed. Please check your credentials.');
    }
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Invalid email or password.');
    }
    return data;
  },

  async getMe(): Promise<{ status: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Unauthenticated');
    }
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.debug('Logout network note:', e);
    }
  },

  async connectGitHub(token?: string, username?: string): Promise<ConnectGitHubResponse> {
    const res = await fetch(`${API_BASE}/auth/connect-github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, username }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to connect GitHub account.');
    }
    return data;
  },
};
