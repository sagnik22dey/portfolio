import { Moon, Sun, SunMoon } from 'lucide-react';
import { cycleThemeMode, useTheme } from '../theme';

/** Button cycling Auto (IST schedule) → Light → Dark. */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { mode, theme } = useTheme();
  const Icon = mode === 'auto' ? SunMoon : theme === 'dark' ? Moon : Sun;
  const label = mode === 'auto' ? `Auto (IST) · ${theme}` : theme === 'dark' ? 'Dark' : 'Light';
  return (
    <button
      type="button"
      onClick={cycleThemeMode}
      aria-label={`Theme: ${label}. Switch theme`}
      title={`Theme: ${label}`}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-ink bg-paper-50 px-3 text-xs font-medium text-ink shadow-sketch-sm transition hover:-translate-y-0.5 active:translate-y-0 ${className}`}
    >
      <Icon size={16} aria-hidden="true" />
      <span className="hidden sm:inline">{mode === 'auto' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
