export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export function getResolvedTheme(theme: Theme) {
  return theme === "dark" ? "dark" : "light";
}

/**
 * Inline boot script — runs before React hydrates so there is no
 * light→dark flash. Sets both:
 *
 *   - `<html class="dark">` (legacy class theme — shadcn / app-shell)
 *   - `<html data-theme="dark">` (Ledger design system spec, §2)
 *
 * Both selectors are kept in sync so existing components and new
 * Ledger components share one source of truth. The runtime toggle
 * (e.g. moon button in the top bar) must update both — see
 * `applyTheme` below.
 */
export const themeInitScript = `
(() => {
  try {
    const storageKey = "${THEME_STORAGE_KEY}";
    const root = document.documentElement;
    const storedTheme = window.localStorage.getItem(storageKey);
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : systemPrefersDark
        ? "dark"
        : "light";

    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

/**
 * Apply a theme at runtime (e.g. from a moon-button toggle) and
 * persist it. Mirrors the boot script — keep them in sync.
 */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage may be unavailable (private mode) — silently ignore. */
  }
}

export function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
