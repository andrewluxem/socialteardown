import { describe, expect, it } from 'vitest';
import {
  EMAIL,
  isAllowed,
  LISTS,
  MAX_BRANDS,
  normalizeHandle,
  parseBrands,
  sitePath,
} from '../supabase/functions/socialteardown-signup/rules.ts';

describe('origins', () => {
  it('allows the site and this project\'s previews', () => {
    expect(isAllowed('https://www.socialteardown.com')).toBe(true);
    expect(isAllowed('https://socialteardown.com')).toBe(true);
    expect(isAllowed('https://socialteardown-abc123xyz-andrewluxemcrm-projects.vercel.app')).toBe(true);
    expect(isAllowed('https://socialteardown-git-feat-watchlist-page-andrewluxemcrm-projects.vercel.app')).toBe(true);
  });
  it('refuses other sites, other projects\' previews and lookalikes', () => {
    expect(isAllowed(null)).toBe(false);
    expect(isAllowed('https://www.inboxteardown.com')).toBe(false);
    expect(isAllowed('https://inboxteardown-abc123-andrewluxemcrm-projects.vercel.app')).toBe(false);
    expect(isAllowed('http://www.socialteardown.com')).toBe(false);
    expect(isAllowed('https://socialteardown-x-andrewluxemcrm-projects.vercel.app.evil.com')).toBe(false);
    expect(isAllowed('https://evil.com/socialteardown-x-andrewluxemcrm-projects.vercel.app')).toBe(false);
  });
});

describe('lists', () => {
  it('accepts only the Social Teardown Watchlist', () => {
    expect([...LISTS]).toEqual(['social-watchlist']);
  });
});

describe('email', () => {
  it('is loose but needs one @ and a dotted domain', () => {
    expect(EMAIL.test('you@company.com')).toBe(true);
    expect(EMAIL.test('a.b+c@mail.co.uk')).toBe(true);
    expect(EMAIL.test('you@company')).toBe(false);
    expect(EMAIL.test('you @company.com')).toBe(false);
    expect(EMAIL.test('you@@company.com')).toBe(false);
  });
});

describe('source path', () => {
  it('keeps same-site paths only', () => {
    expect(sitePath('/watchlist/')).toBe('/watchlist/');
    expect(sitePath('//evil.com/')).toBeNull();
    expect(sitePath('/watchlist/?x=1')).toBeNull();
    expect(sitePath('https://evil.com/')).toBeNull();
    expect(sitePath(null)).toBeNull();
  });
});

describe('handle or website', () => {
  it.each([
    ['@brand', '@brand'],
    ['brand', 'brand'],
    ['brand.co_official', 'brand.co_official'],
    ['  @brand  ', '@brand'],
    ['instagram.com/brand', 'instagram.com/brand'],
    ['https://www.instagram.com/brand/', 'https://www.instagram.com/brand/'],
    ['brand.com', 'brand.com'],
    ['https://www.brand.com/shop?ref=1', 'https://www.brand.com/shop?ref=1'],
    ['http://brand.co.uk:8080/', 'http://brand.co.uk:8080/'],
  ])('keeps %j', (raw, kept) => {
    expect(normalizeHandle(raw)).toBe(kept);
  });
  it.each([null, '', '   ', 'my brand', '@this_handle_is_far_too_long_for_ig', 'javascript:alert(1)', `https://brand.com/${'a'.repeat(200)}`])(
    'drops %j instead of refusing the signup',
    (raw) => {
      expect(normalizeHandle(raw)).toBeNull();
    },
  );
});

describe('brand list', () => {
  it('splits on commas, trims and keeps order', () => {
    expect(parseBrands(' Nike, Adidas ,Puma ')).toEqual(['Nike', 'Adidas', 'Puma']);
  });
  it(`keeps the first ${MAX_BRANDS}`, () => {
    expect(parseBrands('a, b, c, d, e, f, g')).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
  it('drops empties, case-insensitive repeats and overlong names', () => {
    expect(parseBrands(`Nike,, nike , NIKE, ${'x'.repeat(101)}, Puma`)).toEqual(['Nike', 'Puma']);
  });
  it('collapses inner whitespace and control characters', () => {
    expect(parseBrands('Old\tNavy,  The\u0000North   Face')).toEqual(['Old Navy', 'The North Face']);
  });
  it('is null when nothing is left', () => {
    expect(parseBrands(null)).toBeNull();
    expect(parseBrands(' , ,')).toBeNull();
  });
});
