import { useSyncExternalStore } from 'react';

const ACCESS_KEY = 'fleet.access';
const REFRESH_KEY = 'fleet.refresh';
const DEFAULT_PATH = '/vehicles';

function read(key: string): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
}

export function getAccessToken(): string | null {
  return read(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return read(REFRESH_KEY);
}

/** Store the tokens. A missing refresh token keeps the one already stored. */
export function setTokens(tokens: { access: string; refresh?: string }): void {
  window.localStorage.setItem(ACCESS_KEY, tokens.access);
  if (tokens.refresh) window.localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

/**
 * Whether a refresh token is stored.
 *
 * Returns null during the server render and hydration, where storage cannot be read, so callers
 * can show a neutral loading state instead of a mismatched one. Logins and logouts in other tabs
 * update it through the `storage` event.
 */
export function useHasSession(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => getRefreshToken() !== null,
    () => null,
  );
}

/**
 * Return `next` when it is a path inside this app, else the default page.
 *
 * Rejects absolute URLs, protocol-relative URLs (`//host`, `/\host`) and other schemes, so the
 * login redirect cannot send the user to another site or run a `javascript:` URL.
 */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return DEFAULT_PATH;
  }
  return next;
}

/** Login page URL that returns to `next` after signing in. */
export function loginPath(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}

/** Send the browser to the login page after the session could not be renewed. */
export function redirectToLogin(): void {
  const next = window.location.pathname + window.location.search;
  window.location.assign(`${loginPath(next)}&reason=expired`);
}
