import { useSyncExternalStore } from 'react';

export type ThemeMode = 'auto' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

const KEY = 'theme-mode';
const DAY_START = 6;
const DAY_END = 18;
const listeners = new Set<() => void>();

/** Current hour (0-23) in India Standard Time, independent of the visitor's own zone. */
export function istHour(now = new Date()): number {
  const h = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(now);
  return Number(h) % 24;
}

/** Light between 06:00 and 18:00 IST, dark otherwise. */
export function scheduledTheme(now = new Date()): Theme {
  const h = istHour(now);
  return h >= DAY_START && h < DAY_END ? 'light' : 'dark';
}

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

let mode: ThemeMode = typeof window === 'undefined' ? 'auto' : readMode();
let theme: Theme = mode === 'auto' ? scheduledTheme() : mode;
let snapshot = { mode, theme };

function apply() {
  const next = mode === 'auto' ? scheduledTheme() : mode;
  if (next === theme && snapshot.mode === mode) return;
  theme = next;
  snapshot = { mode, theme };
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#171a26' : '#faf6ec');
  }
  listeners.forEach((l) => l());
}

/** Apply the initial theme class and re-check the IST schedule every minute. */
export function initTheme(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  window.setInterval(apply, 60_000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') apply();
  });
}

/** Set the theme mode (auto follows IST) and persist it. */
export function setThemeMode(next: ThemeMode): void {
  mode = next;
  try {
    if (next === 'auto') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    /* storage unavailable */
  }
  apply();
}

/** Cycle auto → light → dark → auto. */
export function cycleThemeMode(): void {
  setThemeMode(mode === 'auto' ? (theme === 'light' ? 'dark' : 'light') : mode === 'light' ? 'dark' : 'auto');
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** React hook returning the current mode and the resolved light/dark theme. */
export function useTheme(): { mode: ThemeMode; theme: Theme } {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}
