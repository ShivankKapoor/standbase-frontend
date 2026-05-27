import { apiFetch } from './client';
import type { LoginResult, SessionCheck } from '../types';

export function login(username: string, password: string): Promise<LoginResult> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function verifyTotp(preAuthToken: string, totpCode: string): Promise<LoginResult> {
  return apiFetch('/auth/totp/verify', {
    method: 'POST',
    body: JSON.stringify({ preAuthToken, totpCode }),
  });
}

export function checkSession(): Promise<SessionCheck> {
  return apiFetch('/session/check');
}

export function logout(): Promise<void> {
  return apiFetch('/session/logout', { method: 'POST' });
}
