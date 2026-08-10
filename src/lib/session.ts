import type { User } from '../types/domain';
let currentSession: { user: User } | null = null;

export function getSession(): { user: User } | null {
  return currentSession;
}

export function setSession(user: User): void {
  currentSession = { user };
}

export function clearSession(): void {
  currentSession = null;
}
