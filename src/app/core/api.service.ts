import { Injectable } from '@angular/core';

const TOKEN_KEY = 'littleroyals.token';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly base = '/api';

  token(): string {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY) ?? '';
  }

  setToken(token: string, remember: boolean) {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    if (!token) return;
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  }

  clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body });
  }

  private async request<T>(path: string, opts: { method: string; body?: unknown }): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    const token = this.token();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(this.base + path, {
      method: opts.method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = (data as { message?: string | string[] }).message;
      throw new Error(Array.isArray(message) ? message.join(', ') : message || res.statusText);
    }
    return data as T;
  }
}
