// The signup function's pure checks, kept free of Deno APIs so the site's
// vitest suite can import them (tests/signup-rules.test.ts).

export const ALLOWED_ORIGINS = new Set(['https://www.socialteardown.com', 'https://socialteardown.com']);
// This project's previews only: socialteardown-<hash or git-branch>-<team>.vercel.app.
export const PREVIEW_ORIGIN = /^https:\/\/socialteardown-[a-z0-9-]+-andrewluxemcrm-projects\.vercel\.app$/;

// The Watchlist waitlist. The value says which site and list a row is for,
// so it never reads as an Inbox Teardown signup even outside this table.
export const LISTS = new Set(['social-watchlist']);

// Deliberately loose: one @, no spaces, a dot in the domain. Typos beyond that
// are the visitor's to fix; the browser's type=email check runs first anyway.
export const EMAIL = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

export const MAX_HANDLE = 200;
export const MAX_BRANDS = 5;
export const MAX_BRAND = 100;

// An Instagram handle: letters, numbers, periods and underscores, up to 30.
const HANDLE = /^@?[A-Za-z0-9._]{1,30}$/;
// A domain with an optional scheme, port and path: brand.com,
// https://www.brand.com/shop, instagram.com/brand.
const SITE_URL = /^(https?:\/\/)?([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(:\d{1,5})?(\/\S*)?$/i;
const CONTROL = /[\u0000-\u001f\u007f]/g;

export function isAllowed(origin: string | null): origin is string {
  return !!origin && (ALLOWED_ORIGINS.has(origin) || PREVIEW_ORIGIN.test(origin));
}

/** A same-site path such as /watchlist/, or null. No //host, no query. */
export function sitePath(v: string | null): string | null {
  if (!v || v.length > 512 || !/^\/(?!\/)[A-Za-z0-9\-._~\/]*$/.test(v)) return null;
  return v;
}

/**
 * The optional handle or website, trimmed: "@brand", "brand",
 * "instagram.com/brand" or a URL. Anything else is null, so an odd value is
 * dropped and never blocks the signup.
 */
export function normalizeHandle(raw: string | null): string | null {
  const v = (raw ?? '').trim();
  if (!v || v.length > MAX_HANDLE || /\s/.test(v)) return null;
  return HANDLE.test(v) || SITE_URL.test(v) ? v : null;
}

/**
 * The optional brand list: comma separated, trimmed, case-insensitive
 * duplicates and names over MAX_BRAND characters dropped, first MAX_BRANDS
 * kept. Null when nothing is left.
 */
export function parseBrands(raw: string | null): string[] | null {
  const seen = new Set<string>();
  const brands: string[] = [];
  for (const part of (raw ?? '').split(',')) {
    const name = part.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim();
    if (!name || name.length > MAX_BRAND) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    brands.push(name);
    if (brands.length === MAX_BRANDS) break;
  }
  return brands.length ? brands : null;
}
